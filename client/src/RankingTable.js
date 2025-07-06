import React from 'react';
import {FaArrowUp, FaArrowDown, FaMinus, FaSort, FaCaretUp, FaCaretDown} from 'react-icons/fa';

/**
 * A component containing the information and logic for the community ranking table.
 */
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
                speed: 0,
                community: 0,
                real: 0,
                change: 0
            }],
            ascending: false,
            sortBy: 'community'
        }

        this.getRanking = this.getRanking.bind(this);
        this.selectStat = this.selectStat.bind(this);
        this.selectSort = this.selectSort.bind(this);
        this.sortList = this.sortList.bind(this);
	}

    componentDidMount() {
		(async () => {
            //default stat is HP
            this.getRanking(this.props.dbFormattedStats[0]);
		})();
	}

    /**
     * Retrieves the community ranking for a stat from the server and populates the list of real ranks with the order of the community rank.
     * @param {string} stat The stat to sort by.
     */
    getRanking(stat) {
        (async () => {
            let asc = this.state.ascending ? 1 : '';
            let json = await fetch(`/pokemon-expectation-vs-reality/ranking?stat=${stat}&asc=${asc}`);
            let result = await json.json();

            //database replaces spaces with underscores while API uses hyphens
            stat = stat.replace('_', '-');

            for (let i = 0; i < result.length; i++) {
                if (asc) {
                    result[i].community = result.length - (i+1);
                }
                else {
                    result[i].community = i;
                }
            }

            for (let pokemon of result) {
                pokemon.real = this.props.sortedLists[stat].indexOf(pokemon.id);
                pokemon.change = pokemon.real - pokemon.community;
            }

            this.setState({
                pokemonList: result
            });

            this.sortList(this.state.sortBy);
        })();
    }

    /**
     * Handler function for selecting a stat from the dropdown.
     * @param {Object} event The captured click event.
     */
    selectStat(event) {
        let stat = event.target.value;
        this.getRanking(stat);
    }

    selectSort(value) {
        if (value === this.state.sortBy) {
            this.setState(
                prevState => ({
                    pokemonList: prevState.pokemonList.toReversed(),
                    ascending: !prevState.ascending
                })
            );
        }
        else {
            this.setState({
                sortBy: value
            });

            this.sortList(value);
        }
    }

    sortList(value) {
        let asc = this.state.ascending;
        if (value === 'community') {
            this.setState(
                prevState => ({
                    pokemonList: prevState.pokemonList.toSorted((a, b) => {
                        if (asc) {
                            return b.community - a.community;
                        }
                        else {
                            return a.community - b.community;
                        }
                    })
                })
            );
        }
        else if (value === 'real') {
            this.setState(
                prevState => ({
                    pokemonList: prevState.pokemonList.toSorted((a, b) => {
                        if (asc) {
                            return b.real - a.real;
                        }
                        else {
                            return a.real - b.real;
                        }
                    })
                })
            );
        }
        else if (value === 'change') {
            this.setState(
                prevState => ({
                    pokemonList: prevState.pokemonList.toSorted((a, b) => {
                        if (asc) {
                            return a.change - b.change;
                        }
                        else {
                            return b.change - a.change;
                        }
                    })
                })
            );
        }
    }

    render() {
        let pokemonList = this.state.pokemonList;
        let stats = this.props.stats;
        let dbStats = this.props.dbFormattedStats;
        let imageList = this.props.imageList;

        //pokemonList contains a placeholder if loading isn't finished
        let loaded = pokemonList.length > 1;

        return (
            <div className='ranking-parent'>
                <h1>Rankings</h1>
                <label htmlFor='stats'>Stat:</label>
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
                            <th className='ranking-header-cell sort-header' onClick={() => this.selectSort('community')}>
                                <span className='sort-header'>
                                    <span className='sort-header-title'>Rank</span>
                                    {this.state.sortBy === 'community' ? (this.state.ascending ? <FaCaretUp /> : <FaCaretDown />) : <FaSort />}
                                </span>
                            </th>
                            <th className='ranking-header-cell'>
                                Pokémon
                            </th>
                            <th className='ranking-header-cell sort-header' onClick={() => this.selectSort('real')}>
                                <span className='sort-header'>
                                    <span className='sort-header-title'>Real Rank</span>
                                    {this.state.sortBy === 'real' ? (this.state.ascending ? <FaCaretUp /> : <FaCaretDown />) : <FaSort />}
                                </span>
                            </th>
                            <th className='ranking-header-cell sort-header' onClick={() => this.selectSort('change')}>
                                <span className='sort-header'>
                                    <span className='sort-header-title'>Change</span>
                                    {this.state.sortBy === 'change' ? (this.state.ascending ? <FaCaretUp /> : <FaCaretDown />) : <FaSort />}
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className='ranking-body'>
                        {pokemonList.map((pokemon, i) => {
                            let changeDirection;
                            let changeClass;
                            if (pokemon.change > 0) {
                                changeDirection = <FaArrowUp />;
                                changeClass = ' higher-stat';
                            }
                            else if (pokemon.change === 0) {
                                changeDirection = <FaMinus />;
                                changeClass = '';
                            }
                            else {
                                changeDirection = <FaArrowDown />;
                                changeClass = ' lower-stat';
                            }

                            //don't display a thumbnail image if the list isn't loaded yet
                            let image = '';
                            if (loaded) {
                                //associate an image in the list with a Pokemon
                                let imageObject = imageList.find((element) => element.id === pokemon.id);
                                let imageUrl;
                                if (imageObject) {
                                    imageUrl = imageObject.image;
                                } else {
                                    imageUrl = null;
                                }
                                
                                image = (<img src={imageUrl} alt={pokemon.name} className='ranking-img'/>);
                            }

                            return (
                                <tr key={pokemon.id}>
                                    <td className='ranking-body-cell'>{pokemon.community+1}</td>
                                    <td className='ranking-body-cell name'>
                                        <figure>
                                            {image}
                                            <figcaption>{pokemon.name}</figcaption>
                                        </figure>
                                    </td>
                                    <td className='ranking-body-cell'>{pokemon.real + 1}</td>
                                    <td className={'ranking-body-cell change' + changeClass}>
                                        <div className='change'>
                                            <span className='change'>
                                                {changeDirection}
                                                <span className='change-amount'>{' ' + Math.abs(pokemon.change)}</span>
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