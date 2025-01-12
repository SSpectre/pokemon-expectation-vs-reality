import React from 'react';
import { isMobile } from 'react-device-detect';
import StatLine from './StatLine';
import RankingTable from './RankingTable';

/**
 * The main Component of the app.
 */
export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			useDBForImages: false,
			pokemonList: [],
			sortedLists: {},
			currentPokemon1: null,
			currentPokemon2: null
		}

		this.selectNewPokemon = this.selectNewPokemon.bind(this);
	}

	componentDidMount() {
		(async () => {
			let json = await fetch("/pokemon-expectation-vs-reality/get");
			let result = await json.json();

			this.setState({
				pokemonList: result.mainList,
				sortedLists: result.sortedLists
			});

			setTimeout(this.selectNewPokemon, 1);
		})();
	}

	/**
	 * Selects two random Pokemon to compare.
	 */
	selectNewPokemon() {
		let random1 = Math.floor(Math.random() * this.state.pokemonList.length);
		let random2 = Math.floor(Math.random() * this.state.pokemonList.length);

		this.setState(prevState => {
			return {
				currentPokemon1: prevState.pokemonList[random1],
				currentPokemon2: prevState.pokemonList[random2]
			}
		});
	}

	render() {
		//display a loading screen if Pokemon haven't been selected yet
		let loaded = this.state.currentPokemon1 && this.state.currentPokemon2;
		let content;

		if (loaded) {
			let imageUrl1 = this.state.currentPokemon1.image_url;
			let imageUrl2 = this.state.currentPokemon2.image_url;
			let imageClassName = isMobile ? 'pokemon-img-mobile' : 'pokemon-img';

			//database has a separate naming convention from that displayed to the user
			let stats = ['HP', 'Attack', 'Defense', 'Special Attack', 'Special Defense', 'Speed'];
			let dbStats = ['hp', 'attack', 'defense', 'special_attack', 'special_defense', 'speed'];

			//associate image URLs with the Pokemon IDs so we don't need to pass the entire Pokemon list to the RatingTable
			let imageList = this.state.pokemonList.map((pokemon) => {
				return {
					id: pokemon.id,
					image: pokemon.image_url
				}
			})

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
								dbFormattedName={dbStats[i]}
								pokemon1={this.state.currentPokemon1}
								pokemon2={this.state.currentPokemon2}
							/>)}
						</tbody>
					</table>
					<div id='end-buttons'>
						<button onClick={this.selectNewPokemon}>
							Compare more Pokémon
						</button>
					</div>
					<RankingTable
						stats={stats}
						dbFormattedStats={dbStats}
						sortedLists={this.state.sortedLists}
						imageList={imageList}
					/>
				</div>
			);
		} else {
			content = (
				<h1>Loading...</h1>
			);
		}

		return (
			<div>
				{content}
			</div>
		);
	}
}