import PokemonAdapter from './PokemonAdapter.js';
import pLimit from 'p-limit';
import express from 'express';

const app = express();

let totalLoadingSteps = 1;
let currentLoadingSteps = 0;

let pokemonList = [];

app.get("/get", (req, res) => {
    res.json(pokemonList);
});

const PORT = process.env.PORT || 8080;

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