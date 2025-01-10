import React from 'react';
import {FaArrowUp, FaArrowDown} from 'react-icons/fa';

export default class RankingTable extends React.Component {
    constructor(props) {
		super(props);

        this.state = {
            pokemonList: [{
                id: 0,
                name: "Loading...",
                hp: 0,
                attack: 0,
                defense: 0,
                special_attack: 0,
                special_defense: 0,
                speed: 0
            }],
            realRank: [0],
            ascending: false
        }

        this.getRanking = this.getRanking.bind(this);
        this.selectStat = this.selectStat.bind(this);
        this.reverseList = this.reverseList.bind(this);
	}

    componentDidMount() {
		(async () => {
            this.getRanking(this.props.dbFormattedStats[0]);
		})();
	}

    getRanking(stat) {
        (async () => {
            let asc = this.state.ascending ? 1 : '';
            let json = await fetch(`/ranking?stat=${stat}&asc=${asc}`);
            let result = await json.json();

            stat = stat.replace('_', '-');

            let real = result.map((pokemon, i) => {
                return this.props.sortedLists[stat].indexOf(pokemon.id);
            });

            this.setState({
                pokemonList: result,
                realRank: real
            });
        })();
    }

    selectStat(event) {
        let stat = event.target.value;
        this.getRanking(stat);
    }

    reverseList(event) {
        this.setState(
            prevState => ({
                pokemonList: prevState.pokemonList.toReversed(),
                realRank: prevState.realRank.toReversed(),
                ascending: event.target.checked
            })
        );
    }

    render() {
        let pokemonList = this.state.pokemonList;
        let realRank = this.state.realRank;
        let stats = this.props.stats;
        let dbStats = this.props.dbFormattedStats;
        let imageList = this.props.imageList;

        let loaded = pokemonList.length > 1;

        return (
            <div className='ranking-parent'>
                <h1>Community Rankings</h1>
                <label htmlFor='stats'>Sort by:</label>
                <select name='stats' id='stat-dropdown' onChange={this.selectStat}>
                    {stats.map((stat, i) => (
                        <option key={stat} value={dbStats[i]}>
                            {stat}
                        </option>
                    ))}
                </select>
                <label htmlFor='ascending'>Ascending?</label>
                <input type='checkbox' id='ascending' name='ascending' onClick={this.reverseList} />
                <table className='ranking-table'>
                    <thead className='ranking-header'>
                        <tr>
                            <th className='ranking-header-cell'>Rank</th>
                            <th className='ranking-header-cell'>Pokémon</th>
                            <th className='ranking-header-cell'>Real Rank</th>
                            <th className='ranking-header-cell'>Change</th>
                        </tr>
                    </thead>
                    <tbody className='ranking-body'>
                        {pokemonList.map((pokemon, i) => {
                            let adjustedIndex = i;
                            if (this.state.ascending) {
                                adjustedIndex = pokemonList.length - (i + 1);
                            }

                            let change = realRank[i] - adjustedIndex;
                            let positive = change >= 0;

                            let image = '';
                            if (loaded) {
                                let imageObject = imageList.find((element) => element.id === pokemon.id);
                                let imageUrl;
                                if (imageObject) {
                                    imageUrl = imageObject.image;
                                } else {
                                    imageUrl = null;
                                }
                                
                                image = (<img src={imageUrl} alt={pokemon.name} />);
                            }

                            return (
                                <tr key={pokemon.id}>
                                    <td className='ranking-body-cell'>{adjustedIndex+1}</td>
                                    <td className='ranking-body-cell name'>
                                        <figure>
                                            {image}
                                            <figcaption>{pokemon.name}</figcaption>
                                        </figure>
                                    </td>
                                    <td className='ranking-body-cell'>{realRank[i]+1}</td>
                                    <td className={'ranking-body-cell change' + (positive ? ' higher-stat' : ' lower-stat')}>
                                        <div className='change'>
                                            <span className='change'>
                                                {positive ? <FaArrowUp /> : <FaArrowDown />}
                                                <span className='change-amount'>{' ' + Math.abs(change)}</span>
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}