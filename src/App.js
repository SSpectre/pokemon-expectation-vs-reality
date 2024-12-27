import React from 'react';
import { isMobile } from 'react-device-detect';
import './App.css';
import PokemonAdapter from './PokemonAdapter';
import StatLine from './StatLine';
import pLimit from 'p-limit';

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			useDBForImages: false,
			totalLoadingSteps: 1,
			currentLoadingSteps: 0,
			pokemonList: [],
			currentPokemon1: null,
			currentPokemon2: null
		}

		this.selectNewPokemon = this.selectNewPokemon.bind(this);
	}

	componentDidMount() {
		(async () => {
			//fetch urls to pokemon objects from apis
			const json = await this.fetchJson('https://pokeapi.co/api/v2/pokemon?limit=2000', false);
			this.setState({
				totalLoadingSteps: json.count
			});
			const pokemonUrls = await json.results;

			//limit to 400 simultaneous API requests
			const limit = pLimit(400);

			const pokemonList = await Promise.all(
				pokemonUrls.map(async (pokemon) => {
					return await limit(() => this.fetchJson(pokemon.url, true));
				})
			);
			this.setState({
				pokemonList: pokemonList,
			});

			let useDB = this.state.useDBForImages;
			let filteredPokemon = PokemonAdapter.performAllActions(pokemonList, useDB)
			this.setState({
				pokemonList: filteredPokemon,
			});

			//this.state.pokemonList doesn't populate unless you wait some amount of time for reason
			setTimeout(this.selectNewPokemon, 1);
		})();
	}

	fetchJson(url, loadingStep) {
		let response = fetch(url)
		.then(
			(result) => {
				if (loadingStep) {
					this.setState(prevState => {
						return {currentLoadingSteps: prevState.currentLoadingSteps + 1};
					});
				}

				const json = result.json();
				return json;
			}
		);

		return response;
	}

	async selectNewPokemon() {
		let random1 = Math.floor(Math.random() * this.state.pokemonList.length);
		let random2 = Math.floor(Math.random() * this.state.pokemonList.length);

		await this.setState(prevState => {
			return {
				currentPokemon1: prevState.pokemonList[random1],
				currentPokemon2: prevState.pokemonList[random2]
			}
		});
	}

	getImageUrl(pokemon) {
		let imageUrl;
		if (this.state.useDBForImages) {
			imageUrl = 'https://img.pokemondb.net/artwork/' + pokemon.name + '.jpg'
		} else {
			let imageBase = pokemon.sprites.other
			imageUrl = imageBase['official-artwork']['front_default'];
		}

		return imageUrl;
	}

	render() {
		let loaded = this.state.currentPokemon1 && this.state.currentPokemon2;
		let content;

		if (loaded) {
			let imageUrl1 = this.getImageUrl(this.state.currentPokemon1);
			let imageUrl2 = this.getImageUrl(this.state.currentPokemon2);
			let imageClassName = isMobile ? 'pokemon-img-mobile' : 'pokemon-img';
			let stats = ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'];

		 	content = (
				<div>
					<table>
						<thead>
							<tr>
								<th>
									<img
										className={imageClassName}
										src={imageUrl1}
										alt={this.state.currentPokemon1.name}
									/>
								</th>
								<th></th>
								<th>
									<img
										className={imageClassName}
										src={imageUrl2}
										alt={this.state.currentPokemon2.name}
									/>
								</th>
							</tr>
							<tr className='full-width'>
								<th className='line-break' colSpan='3'>
									Which of these Pokémon looks like it should have higher...
								</th>
							</tr>
						</thead>
						<tbody>
							{stats.map((stat, i) => <StatLine
								key={stat}
								index={i}
								name={stat}
								pokemon1={this.state.currentPokemon1}
								pokemon2={this.state.currentPokemon2}
							/>)}
						</tbody>
					</table>
					<div id='end-buttons'>
						<button>Community Rankings</button>
						<button onClick={this.selectNewPokemon}>
							Compare more Pokémon
						</button>
					</div>
				</div>
			);
		} else {
			let percentage = Math.floor((this.state.currentLoadingSteps / this.state.totalLoadingSteps) * 100);
			content = (
				<h1>Loading ({percentage}%)...</h1>
			);
		}

		return (
			<div>
				{content}
			</div>
		);
	}
}