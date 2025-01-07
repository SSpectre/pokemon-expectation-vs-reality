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
            realRank: [0]
        };

        this.getRanking = this.getRanking.bind(this);
        this.selectStat = this.selectStat.bind(this);
	}

    componentDidMount() {
		(async () => {
            this.getRanking(this.props.dbFormattedStats[0]);
		})();
	}

    getRanking(stat) {
        (async () => {
            let json = await fetch(`/ranking?stat=${stat}`);
            let result = await json.json();

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

    render() {
        let pokemonList = this.state.pokemonList;
        let realRank = this.state.realRank;
        let stats = this.props.stats;
        let dbStats = this.props.dbFormattedStats;

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
                            let change = realRank[i] - i;
                            let positive = change >= 0;

                            return (
                                <tr key={pokemon.id}>
                                    <td className='ranking-body-cell'>{i+1}</td>
                                    <td className='ranking-body-cell name'>{pokemon.name}</td>
                                    <td className='ranking-body-cell'>{realRank[i]+1}</td>
                                    <td className={'ranking-body-cell change' + (positive ? ' higher-stat' : ' lower-stat')}>
                                        <div className='change'>
                                            {positive ? <FaArrowUp /> : <FaArrowDown />}
                                            {' ' + Math.abs(change)}
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