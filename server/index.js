import PokemonAdapter from './PokemonAdapter.js';
import pLimit from 'p-limit';
import express from 'express';
import DatabaseAPI from './DatabaseAPI.js';

const app = express();

const PORT = process.env.PORT || 8080;

const db = new DatabaseAPI();

let useDBForImages = false;

let pokemonList = [];
let sortedLists = {};

app.use(express.json());

/**
 * Returns the main list of Pokemon Objects and the lists of IDs sorted by each stat to the client.
 */
app.get("/pokemon-expectation-vs-reality/get", (req, res) => {
	let response = {
		mainList: pokemonList,
		sortedLists: sortedLists
	}
    res.json(response);
});

/**
 * Updates the Elo rating of a single stat for a single Pokemon when a vote is cast from the client. Returns a success message when finished.
 */
app.put("/pokemon-expectation-vs-reality/update", async (req, res) => {
	const id1 = req.body.id1;
	const id2 = req.body.id2;
	const stat = req.body.stat;
	const result = req.body.result;

	let matchNumberName = stat + "_match_number";
	let reachedThresholdName = stat + "_reached_threshold";
	
	let row1 = await db.getPokemonStatElo(id1, stat);
	let row2 = await db.getPokemonStatElo(id2, stat);

	let elo1 = row1[stat];
	let elo2 = row2[stat];
	let matchNumber1 = row1[matchNumberName];
	let matchNumber2 = row2[matchNumberName];
	let reachedThreshold1 = row1[reachedThresholdName];
	let reachedThreshold2 = row2[reachedThresholdName];

	//expected values are between 0.0 and 1.0 inclusive, and both add up to 1.0.
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

	reachedThreshold1 = checkKThreshold(elo1, reachedThreshold1);
	reachedThreshold2 = checkKThreshold(elo2, reachedThreshold2);

	await db.updatePokemonStatElo(id1, stat, elo1, matchNumber1, reachedThreshold1);
	await db.updatePokemonStatElo(id2, stat, elo2, matchNumber2, reachedThreshold2);

	res.send({"message": "Success"});
})

/**
 * Queries the database for a list of all Pokemon sorted by the Elo of a single stat and returns the results to the client.
 */
app.get("/pokemon-expectation-vs-reality/ranking", async (req, res) => {
    let result = await db.getAllPokemon(req.query.stat, req.query.asc);
	res.json(result);
});

/**
 * Initializes the server and waits for connections.
 */
app.listen(PORT, function() {
    (async () => {
		//fetch urls to pokemon objects from PokeAPI
		const json = await fetchJson('https://pokeapi.co/api/v2/pokemon?limit=2000');
		const pokemonUrls = await json.results;

		//limit to 400 simultaneous API requests
		const limit = pLimit(400);

		//populate Pokemon list with JSON Objects from PokeAPI
		pokemonList = await Promise.all(
			pokemonUrls.map(async (pokemon) => {
				return await limit(() => fetchJson(pokemon.url));
			})
		);

		pokemonList = PokemonAdapter.performAllActions(pokemonList, false);

		//associate an image URL with each Pokemon
		for (const pokemon of pokemonList) {
			let imageUrl = getImageUrl(pokemon);
			pokemon.image_url = imageUrl
		}

		//if the Pokemon is new, add it to the database
		db.addPokemon(pokemonList);

		//create six lists of all Pokemon IDs, each sorted by a stat, so we can compare the real ranking with the community one
		let apiStats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];
		for (const stat of apiStats) {
			let sorted = getSortedList(pokemonList, stat);
			let idList = sorted.map((pokemon) => pokemon.id);
			sortedLists[stat] = idList;
		}

		console.log("Listening on port " + PORT);
	})();
});

/**
 * Wrapper function for fetch requests retrieving and parsing JSON from third-party sites.
 * @param {string} url The URL to send the request to.
 * @returns {Promise<Object>} A Promise representing a JSON object.
 */
function fetchJson(url) {
	console.log("Fetching " + url);
	let response = fetch(url)
	.then(
		(result) => {
			const json = result.json();
			return json;
		}
	);

	return response;
}

/**
 * Wrapper function for retrieving URLs to Pokemon images from third-party sites.
 * @param {Object} pokemon The Pokemon whose image is being retrieved.
 * @returns {string} The URL of the image to use.
 */
function getImageUrl(pokemon) {
	let imageUrl;

	//PokemonDB uses jpg instead of png, but PokeAPI has more complete and up-to-date art
	if (useDBForImages) {
		imageUrl = 'https://img.pokemondb.net/artwork/' + pokemon.name + '.jpg'
	} else {
		let imageBase = pokemon.sprites.other
		imageUrl = imageBase['official-artwork']['front_default'];
	}

	return imageUrl;
}

/**
 * Sorts a list of Pokemon Objects by a chosen stat.
 * @param {Object[]} list The list of Pokemon to be sorted.
 * @param {string} stat The stat to sort by.
 * @returns {Object[]} The sorted list.
 */
function getSortedList(list, stat) {
	return list.toSorted((a, b) => {
		//PokeAPI stores the stat value in "base_stat" and its name as a child of a sibling attribute, "stat"
		//need to connect the two before they can be used
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

/**
 * Determines the K-factor for calculating the new Elo of a stat.
 * @param {number} matchNumber How many votes have been made regarding this stat for this Pokemon.
 * @param {number} reachedThreshold Whether the Elo for this stat has ever reached >= 2400 or <= -400. Should be 1 for true and 0 for false.
 * @returns The K-factor.
 */
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

/**
 * Calculates the new Elo rating after a vote.
 * @param {number} elo The current Elo rating.
 * @param {number} k The K-factor.
 * @param {number} score The result of the vote. 1.0 for a win, 0.5 for a tie, and 0.0 for a loss.
 * @param {number} expected The expected score. A decimal number between 0.0 and 1.0 inclusive.
 * @returns The new Elo rating, rounded to the nearest integer.
 */
function calculateNewElo(elo, k, score, expected) {
	let result = elo + k * (score - expected);
	return Math.round(result);
}

/**
 * Checks if an Elo score has reached the threshold for a smaller K-factor or has done so in the past.
 * @param {number} elo The Elo rating to check.
 * @param {number} reachedThreshold Whether the Elo rating has reached the threshold in the past. 1 for true and 0 for false.
 * @returns 
 */
function checkKThreshold(elo, reachedThreshold) {
	if (reachedThreshold || elo >= 2400 || elo <= -400) {
		return 1;
	} else {
		return 0;
	}
}