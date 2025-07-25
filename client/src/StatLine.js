import React from 'react';

/**
 * A component containing the information and logic for comparing a single stat between two Pokemon.
 */
export default class StatLine extends React.Component {
    constructor(props) {
		super(props);

        let classes = this.initializeStats();

        this.state = {
            statClass1: classes.class1,
            gmax1: classes.gmax1,
            statClass2: classes.class2,
            gmax2: classes.gmax2,
            selected: -1
        };

        this.selectOption = this.selectOption.bind(this);
	}

    componentDidUpdate(prevProps) {
        //only update if new Pokemon have been chosen
        if (prevProps.pokemon1 !== this.props.pokemon1 || prevProps.pokemon2 !== this.props.pokemon2) {
            let classes = this.initializeStats();

            this.setState({
                statClass1: classes.class1,
                gmax1: classes.gmax1,
                statClass2: classes.class2,
                gmax2: classes.gmax2,
                selected: -1
            });
        }
    }

    /**
     * Compares the stats of the Pokemon to compare and set the CSS class name for the display text accordingly.
     * @returns {Object} An object specifying the CSS class names.
     */
    initializeStats() {
        let stat1 = this.props.pokemon1.stats[this.props.index]['base_stat'];
        let stat2 = this.props.pokemon2.stats[this.props.index]['base_stat'];
        let statClass1 = 'equal-stat';
        let statClass2 = 'equal-stat';
        let isGmax1 = false;
        let isGmax2 = false;

        //if the stats are equal, the class will stay as 'equal-stat'
        if (stat1 > stat2) {
            statClass1 = 'higher-stat';
            statClass2 = 'lower-stat';
        } else if (stat1 < stat2) {
            statClass1 = 'lower-stat';
            statClass2 = 'higher-stat';
        }

        if (this.props.pokemon1.name.match(/-Gigantamax$/g)) {
            isGmax1 = true;
        }
        if (this.props.pokemon2.name.match(/-Gigantamax$/g)) {
            isGmax2 = true;
        }

        let classes = {
            class1: statClass1,
            gmax1: isGmax1,
            class2: statClass2,
            gmax2: isGmax2
        }

        return classes;
    }

    /**
     * Sends the results of a vote to the server.
     * @param {number} result Vote result. 1 for left Pokemon winning, 2 for right Pokemon winning, and 0 for tie.
     */
    selectOption(result) {
        this.setState({
            selected: result
        });

        fetch("/pokemon-expectation-vs-reality/update", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id1: this.props.pokemon1.id,
                id2: this.props.pokemon2.id,
                stat: this.props.dbFormattedName,
                result: result
            })
        });
    }

    render() {
        let hpStat = this.props.name === 'HP';

        return (
            <>
                <tr>
                    <td className={'main-section-header ' + this.state.statClass1 + (this.state.selected >= 0 ? ' visible' : ' invisible')}>
                        {this.props.pokemon1.stats[this.props.index]['base_stat'] + (hpStat && this.state.gmax1 ? '*' : '')}
                    </td>
                    <td className='main-section-header center-column'>...{this.props.name}?</td>
                    <td className={'main-section-header ' + this.state.statClass2 + (this.state.selected >= 0 ? ' visible' : ' invisible')}>
                        {this.props.pokemon2.stats[this.props.index]['base_stat'] + (hpStat && this.state.gmax2 ? '*' : '')}
                    </td>
                </tr>
                <tr>
                    <td className='main-section-header line-break'>
                        <button className={this.state.selected === 1 ? 'selected' : ''} id = {'button-' + this.props.index + '-1'}
                            onClick={() => {this.selectOption(1)}} disabled={this.state.selected >= 0}
                        >
                            {this.props.pokemon1.name}
                        </button>
                    </td>
                    <td className='main-section-header line-break'>
                        <button className={this.state.selected === 0 ? 'selected' : ''} id = {'button-' + this.props.index + '-unsure'}
                            onClick={() => {this.selectOption(0)}} disabled={this.state.selected >= 0}
                        >
                            I'm not sure
                        </button>
                    </td>
                    <td className='main-section-header line-break'>
                        <button className={this.state.selected === 2 ? 'selected' : ''} id = {'button-' + this.props.index + '-2'}
                            onClick={() => {this.selectOption(2)}} disabled={this.state.selected >= 0}
                        >
                            {this.props.pokemon2.name}
                        </button>
                    </td>
                </tr>
            </>
        );
    }
}