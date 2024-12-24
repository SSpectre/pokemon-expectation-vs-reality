import React from 'react';
import { isMobile } from 'react-device-detect';
import './App.css';
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

			let filteredPokemon = this.filterAndFormat(pokemonList);
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

	filterAndFormat(originalList) {
		let filteredPokemon;

		if (this.state.useDBForImages) {
			//filter out forms that have no pokemondb artwork or only minor differences
			filteredPokemon = originalList.filter((value, index, arr) => {
				let tempName = value.name;
				let result = true;

				result = !tempName.match(/-totem/g);
				result = result && !tempName.match(/-cap$/g);
				result = result && !tempName.match(/-cosplay$/g);
				result = result && !tempName.match(/castform-/g);
				result = result && !tempName.match(/-battle-bond$/g);
				result = result && !tempName.match(/-eternal$/g);
				result = result && !tempName.match(/minior-(?!red)/g);
				result = result && !tempName.match(/-power-construct$/g);
				result = result && !tempName.match(/-own-tempo$/g);
				result = result && !tempName.match(/-busted$/g);
				result = result && !tempName.match(/-original$/g);
				result = result && !tempName.match(/cramorant-/g);
				result = result && !tempName.match(/-low-key-gmax$/g);
				result = result && !tempName.match(/-eternamax$/g);
				result = result && !tempName.match(/-dada$/g);
				result = result && !tempName.match(/-bloodmoon$/g);
				result = result && !tempName.match(/-family-of-three$/g);
				result = result && !tempName.match(/squawkabilly-/g);
				result = result && !tempName.match(/-three-segment$/g);
				result = result && !tempName.match(/koraidon-/g);
				result = result && !tempName.match(/miraidon-/g);
				result = result && !tempName.match(/ogerpon-/g);

				return result;
			})

			//change form names to how pokemondb formats them
			for (const pokemon of filteredPokemon) {
				pokemon.name = pokemon.name.replace(/gmax/g, 'gigantamax');
				pokemon.name = pokemon.name.replace(/alola/g, 'alolan');
				pokemon.name = pokemon.name.replace(/galar/g, 'galarian');
				pokemon.name = pokemon.name.replace(/hisui/g, 'hisuian');
				pokemon.name = pokemon.name.replace(/paldea/g, 'paldean');
				pokemon.name = pokemon.name.replace(/starter/g, 'lets-go');
				pokemon.name = pokemon.name.replace(/-red$/g, '-core');
				pokemon.name = pokemon.name.replace(/-red-meteor$/g, '-meteor');
				pokemon.name = pokemon.name.replace(/-disguised$/g, '');
				pokemon.name = pokemon.name.replace(/necrozma-dusk/g, 'necrozma-dusk-mane');
				pokemon.name = pokemon.name.replace(/necrozma-dawn/g, 'necrozma-dawn-wings');
				pokemon.name = pokemon.name.replace(/amped-/g, '');
				pokemon.name = pokemon.name.replace(/zacian$/g, 'zacian-hero');
				pokemon.name = pokemon.name.replace(/zamazenta$/g, 'zamazenta-hero');
				pokemon.name = pokemon.name.replace(/calyrex-ice$/g, 'calyrex-ice-rider');
				pokemon.name = pokemon.name.replace(/calyrex-shadow$/g, 'calyrex-shadow-rider');
				pokemon.name = pokemon.name.replace(/-combat-breed$/g, '');
				pokemon.name = pokemon.name.replace(/paldean-blaze-breed$/g, 'blaze');
				pokemon.name = pokemon.name.replace(/paldean-aqua-breed$/g, 'aqua');
			}
		} else {
			//filter out forms that have no artwork or only minor differences
			filteredPokemon = originalList.filter((value, index, arr) => {
				let tempName = value.name;
				let result = true;

				result = !tempName.match(/-totem/g);
				result = result && !tempName.match(/-cap$/g);
				result = result && !tempName.match(/-cosplay$/g);
				result = result && !tempName.match(/-battle-bond$/g);
				result = result && !tempName.match(/minior-(?!red)/g);
				result = result && !tempName.match(/-power-construct$/g);
				result = result && !tempName.match(/-own-tempo$/g);
				result = result && !tempName.match(/-busted$/g);
				result = result && !tempName.match(/-original$/g);
				result = result && !tempName.match(/cramorant-/g);
				result = result && !tempName.match(/-low-key-gmax$/g);
				result = result && !tempName.match(/-dada$/g);
				result = result && !tempName.match(/koraidon-/g);
				result = result && !tempName.match(/miraidon-/g);

				return result;
			})

			//change form names to improve formatting
			for (const pokemon of filteredPokemon) {
				pokemon.name = pokemon.name.replace(/gmax/g, 'gigantamax');
				pokemon.name = pokemon.name.replace(/-red$/g, '-core');
				pokemon.name = pokemon.name.replace(/-red-meteor$/g, '-meteor');
				pokemon.name = pokemon.name.replace(/-disguised$/g, '');
				pokemon.name = pokemon.name.replace(/necrozma-dusk/g, 'necrozma-dusk-mane');
				pokemon.name = pokemon.name.replace(/necrozma-dawn/g, 'necrozma-dawn-wings');
				pokemon.name = pokemon.name.replace(/amped-/g, '');
				pokemon.name = pokemon.name.replace(/calyrex-ice$/g, 'calyrex-ice-rider');
				pokemon.name = pokemon.name.replace(/calyrex-shadow$/g, 'calyrex-shadow-rider');
				pokemon.name = pokemon.name.replace(/oinkologne$/g, 'oinkologne-male');
			}
		}

		return filteredPokemon;
	}

	async selectNewPokemon() {
		console.log(this.state.pokemonList);
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
		let selection;

		if (loaded) {
			let imageUrl1 = this.getImageUrl(this.state.currentPokemon1);
			let imageUrl2 = this.getImageUrl(this.state.currentPokemon2);
			let imageClassName = isMobile ? 'pokemon-img-mobile' : 'pokemon-img';

		 	selection = (
				<div>
					<div>
						<img
							className={imageClassName}
							src={imageUrl1}
							alt={this.state.currentPokemon1.name}
						/>
						<img
							className={imageClassName}
							src={imageUrl2}
							alt={this.state.currentPokemon2.name}
						/>
					</div>
				</div>
			);
		} else {
			let percentage = Math.floor((this.state.currentLoadingSteps / this.state.totalLoadingSteps) * 100);
			selection = (
				<h1>Loading ({percentage}%)...</h1>
			);
		}

		return (
			<div>
				{selection}
			</div>
		);
	}
}