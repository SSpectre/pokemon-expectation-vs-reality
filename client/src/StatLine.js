import React from 'react'

export default class StatLine extends React.Component {
    constructor(props) {
		super(props);

        let classes = this.initializeStats();

        this.state = {
            statClass1: classes.class1,
            statClass2: classes.class2,
            visibleStats: false
        };

        this.selectOption = this.selectOption.bind(this);
	}

    componentDidUpdate(prevProps) {
        if (prevProps.pokemon1 !== this.props.pokemon1 || prevProps.pokemon2 !== this.props.pokemon2) {
            let classes = this.initializeStats();

            this.setState({
                statClass1: classes.class1,
                statClass2: classes.class2,
                visibleStats: false
            });
        }
    }

    initializeStats() {
        let stat1 = this.props.pokemon1.stats[this.props.index]['base_stat'];
        let stat2 = this.props.pokemon2.stats[this.props.index]['base_stat'];
        let statClass1 = 'equal-stat';
        let statClass2 = 'equal-stat';

        //if the stats are equal, the class will stay as 'equal-stat'
        if (stat1 > stat2) {
            statClass1 = 'higher-stat';
            statClass2 = 'lower-stat';
        } else if (stat1 < stat2) {
            statClass1 = 'lower-stat';
            statClass2 = 'higher-stat';
        }

        let classes = {
            class1: statClass1,
            class2: statClass2
        }

        return classes;
    }

    selectOption() {
        this.setState({
            visibleStats: true
        });
    }

    render() {
        

        return (
            <>
                <tr>
                    <td className={this.state.statClass1 + (this.state.visibleStats ? ' visible' : ' invisible')}>
                        {this.props.pokemon1.stats[this.props.index]['base_stat']}
                    </td>
                    <td>...{this.props.name}?</td>
                    <td className={this.state.statClass2 + (this.state.visibleStats ? ' visible' : ' invisible')}>
                        {this.props.pokemon2.stats[this.props.index]['base_stat']}
                    </td>
                </tr>
                <tr>
                    <td className='line-break'>
                        <button id = {'button-' + this.props.index + '-1'} onClick={this.selectOption}>
                            {this.props.pokemon1.name}
                        </button>
                    </td>
                    <td className='line-break'>
                        <button id = {'button-' + this.props.index + '-unsure'} onClick={this.selectOption}>
                            I'm not sure
                        </button>
                    </td>
                    <td className='line-break'>
                        <button id = {'button-' + this.props.index + '-2'} onClick={this.selectOption}>
                            {this.props.pokemon2.name}
                        </button>
                    </td>
                </tr>
            </>
        );
    }
}