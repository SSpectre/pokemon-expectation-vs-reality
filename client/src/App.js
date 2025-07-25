import React from 'react';
import StatLine from './StatLine';
import RankingTable from './RankingTable';
import LoadingScreen from './LoadingScreen';

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
			currentPokemon2: null,
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
	 * Selects two random Pokemon to compare, prioritizing ones with lower numbers of matches
	 */
	selectNewPokemon() {
		let matchNumbers;
		(async () => {
			let json = await fetch("/pokemon-expectation-vs-reality/matches", {cache: 'no-cache'});
			matchNumbers = await json.json();

			//find the pokemon with the lowest number of matches
			//second lowest is also found to determine if more than one pokemon has the lowest match number
			let secondLowest = Infinity;
			let lowestPokemon = matchNumbers.reduce((currentLowest, pokemon) => {
				if (pokemon['match_number'] <= currentLowest['match_number']) {
					secondLowest = currentLowest['match_number'];
					return pokemon;
				}
				else {
					if (pokemon['match_number'] < secondLowest) {
						secondLowest = pokemon['match_number'];
					}

					return currentLowest;
				}
			});

			let lowestMatchNumber = lowestPokemon['match_number'];

			let eligiblePokemon;
			let i1;
			let i2;
			if (lowestMatchNumber === secondLowest) {
				//multiple pokemon have the lowest match number, so we can filter for just that number
				eligiblePokemon = this.state.pokemonList.filter((pokemon) => {
					let matchNumber = matchNumbers.find((mn) => mn['id'] === pokemon.id);
					return matchNumber['match_number'] === lowestMatchNumber;
				});

				i1 = Math.floor(Math.random() * eligiblePokemon.length);

				//prevent self-matchups
				do {
					i2 = Math.floor(Math.random() * eligiblePokemon.length);
				} while (i2 === i1);
			}
			else {
				//only one pokemon has the lowest match number, so we need to filter for both the lowest and second lowest
				eligiblePokemon = this.state.pokemonList.filter((pokemon) => {
					let matchNumber = matchNumbers.find((mn) => mn['id'] === pokemon.id);
					return matchNumber['match_number'] <= secondLowest;
				});

				//guarantee the pokemon with lowest match number is picked
				let guaranteedPokemon = eligiblePokemon.find((pokemon) => pokemon.id === lowestPokemon['id']);
				i1 = eligiblePokemon.indexOf(guaranteedPokemon);

				//prevent self-matchups
				do {
					i2 = Math.floor(Math.random() * eligiblePokemon.length);
				} while (i2 === i1);
			}

			this.setState({
				currentPokemon1: eligiblePokemon[i1],
				currentPokemon2: eligiblePokemon[i2],
			});
		})();
	}

	render() {
		//display a loading screen if Pokemon haven't been selected yet
		let loaded = this.state.currentPokemon1 && this.state.currentPokemon2;
		let content;

		if (loaded) {
			let imageUrl1 = this.state.currentPokemon1.image_url;
			let imageUrl2 = this.state.currentPokemon2.image_url;

			let gmaxNote = '';
			if (this.state.currentPokemon1.name.match(/-Gigantamax$/g) || this.state.currentPokemon2.name.match(/-Gigantamax$/g)) {
				gmaxNote = (
					<h4 id='gmax-note'>
						*Gigantamax Pokémon have double HP, but this doesn't affect base stats
					</h4>
				)
			}

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
					<div id='pokemon-images'>
						<div>
							<img
								className='pokemon-img'
								src={imageUrl1}
								alt={this.state.currentPokemon1.name}
							/>
						</div>
						<div>
							<img
								className='pokemon-img'
								src={imageUrl2}
								alt={this.state.currentPokemon2.name}
							/>
						</div>
					</div>
					<table className='main-section'>
						<caption className='line-break'>Based on appearance alone, which Pokémon looks like it should have higher...</caption>
						<tbody className='main-section-body'>
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
						{gmaxNote}
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
				<LoadingScreen />
			);
		}

		return (
			<div>
				{content}
			</div>
		);
	}
}