import PokemonAdapter from './PokemonAdapter.js';
import pLimit from 'p-limit';
import express from 'express';
import DatabaseAPI from './DatabaseAPI.js';

const app = express();

const PORT = process.env.PORT || 8080;

const db = new DatabaseAPI();

let totalLoadingSteps = 1;
let currentLoadingSteps = 0;

let useDBForImages = false;

let pokemonList = [];
let sortedLists = {};

app.use(express.json());

app.get("/get", (req, res) => {
	let response = {
		mainList: pokemonList,
		sortedLists: sortedLists
	}
    res.json(response);
});

app.put("/update", async (req, res) => {
	const id1 = req.body.id1;
	const id2 = req.body.id2;
	const stat = req.body.stat;
	const result = req.body.result;

	let matchNumberName = stat + "_match_number";
	let reachedThresholdName = stat + "_reached_threshold";
	
	let row1 = await db.getPokemonStatElo(id1, stat, matchNumberName, reachedThresholdName);
	let row2 = await db.getPokemonStatElo(id2, stat, matchNumberName, reachedThresholdName);

	let elo1 = row1[stat];
	let elo2 = row2[stat];
	let matchNumber1 = row1[matchNumberName];
	let matchNumber2 = row2[matchNumberName];
	let reachedThreshold1 = row1[reachedThresholdName];
	let reachedThreshold2 = row2[reachedThresholdName];

	let expected1 = 1 / (1 + 10 ** ((elo2 - elo1) / 400))
	let expected2 = 1 - expected1;

	let k1 = calculateKValue(matchNumber1, reachedThreshold1);
	let k2 = calculateKValue(matchNumber2, reachedThreshold2);

	let score1;
	let score2;

	if (result == 1) { //pokemon 1 wins
		score1 = 1;
		score2 = 0;
	} else if (result == 2) { //pokemon 2 wins
		score1 = 0;
		score2 = 1;
	} else { //tie
		score1 = 0.5;
		score2 = 0.5;
	}

	elo1 = calculateNewElo(elo1, k1, score1, expected1);
	elo2 = calculateNewElo(elo2, k2, score2, expected2);

	matchNumber1++;
	matchNumber2++;

	reachedThreshold1 = checkKThreshold(elo1);
	reachedThreshold2 = checkKThreshold(elo2);

	await db.updatePokemonStatElo(id1, stat, elo1, matchNumber1, matchNumberName, reachedThreshold1, reachedThresholdName);
	await db.updatePokemonStatElo(id2, stat, elo2, matchNumber2, matchNumberName, reachedThreshold2, reachedThresholdName);

	res.send({"message": "Success"});
})

app.get("/ranking", async (req, res) => {
    let result = await db.getAllPokemon(req.query.stat, req.query.asc);
	res.json(result);
});

app.listen(PORT, function() {
    (async () => {
		//fetch urls to pokemon objects from apis
		const json = await fetchJson('https://pokeapi.co/api/v2/pokemon?limit=2000', false);
		totalLoadingSteps = json.count;
		const pokemonUrls = await json.results;

		//limit to 400 simultaneous API requests
		const limit = pLimit(400);

		pokemonList = await Promise.all(
			pokemonUrls.map(async (pokemon) => {
				return await limit(() => fetchJson(pokemon.url, true));
			})
		);

		pokemonList = PokemonAdapter.performAllActions(pokemonList, false);

		for (const pokemon of pokemonList) {
			let imageUrl = getImageUrl(pokemon);
			pokemon.image_url = imageUrl
		}

		db.addPokemon(pokemonList);

		let apiStats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
		for (const stat of apiStats) {
			let sorted = getSortedList(pokemonList, stat);
			let idList = sorted.map((pokemon) => pokemon.id);
			sortedLists[stat] = idList;
		}

		console.log("Listening on port " + PORT);
	})();
});

function fetchJson(url, loadingStep) {
	console.log("Fetching " + url);
	let response = fetch(url)
	.then(
		(result) => {
			if (loadingStep) {
				currentLoadingSteps++;
			}

			const json = result.json();
			return json;
		}
	);

	return response;
}

function getImageUrl(pokemon) {
	let imageUrl;
	if (useDBForImages) {
		imageUrl = 'https://img.pokemondb.net/artwork/' + pokemon.name + '.jpg'
	} else {
		let imageBase = pokemon.sprites.other
		imageUrl = imageBase['official-artwork']['front_default'];
	}

	return imageUrl;
}

function getSortedList(list, stat) {
	return list.toSorted((a, b) => {
		let aStat = a.stats.find((element) => element.stat.name == stat);
		let bStat = b.stats.find((element) => element.stat.name == stat);

		let aTotal = 0;
		for (const stat of a.stats) {
			aTotal += stat.base_stat;
		}
		let bTotal = 0;
		for (const stat of b.stats) {
			bTotal += stat.base_stat;
		}

		return bStat.base_stat - aStat.base_stat || bTotal - aTotal;
	});
}

function calculateKValue(matchNumber, reachedThreshold) {
	let k;
	if (matchNumber >= 30) {
		if (reachedThreshold) {
			k = 10;
		} else {
			k = 20;
		}
	} else {
		k = 40;
	}

	return k;
}

function calculateNewElo(elo, k, score, expected) {
	let result = elo + k * (score - expected);
	return Math.round(result);
}

function checkKThreshold(elo) {
	if (elo >= 2400 || elo <= -400) {
		return 1;
	} else {
		return 0;
	}
}