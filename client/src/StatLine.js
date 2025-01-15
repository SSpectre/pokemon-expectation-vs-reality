import React from 'react';

/**
 * A component containing the information and logic for comparing a single stat between two Pokemon.
 */
export default class StatLine extends React.Component {
    resizeObserver = null;
    buttonRef1 = React.createRef();
    buttonRef2 = React.createRef();

    constructor(props) {
		super(props);

        let classes = this.initializeStats();

        this.state = {
            statClass1: classes.class1,
            statClass2: classes.class2,
            selected: false,
            buttonDimensions: {
                width: 'auto',
                height: 'auto'
            },
            firstTime: true
        };

        this.selectOption = this.selectOption.bind(this);
        this.resetButtons = this.resetButtons.bind(this);
        this.resizeButtons = this.resizeButtons.bind(this);
	}

    componentDidMount() {
        this.resizeButtons();

        this.resizeObserver = new ResizeObserver((entries) => {
            this.resizeButtons();
        })

        this.resizeObserver.observe(this.buttonRef1.current);
        this.resizeObserver.observe(this.buttonRef2.current);

        let resizeTimeout;
        window.addEventListener("resize", (event) => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(this.resetButtons, 100);
        });
        
        this.setState({
            firstTime: false
        });
    }
    
    componentWillUnmount() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
    }

    componentDidUpdate(prevProps) {
        //only update if new Pokemon have been chosen
        if (prevProps.pokemon1 !== this.props.pokemon1 || prevProps.pokemon2 !== this.props.pokemon2) {
            let classes = this.initializeStats();

            this.setState({
                statClass1: classes.class1,
                statClass2: classes.class2,
                selected: false
            });

            this.resetButtons();
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

    /**
     * Resets the size of both buttons to auto, so the larger one can be calculated
     */
    resetButtons() {
        let buttonDimensions = {
            width: 'auto',
            height: 'auto'
        };

        this.setState({
            buttonDimensions: buttonDimensions
        });
    }

    /**
     * Sets the size of both buttons to the dimensions of the larger one
     */
    resizeButtons() {
        //need to use getBoundClientRect, otherwise dimensions are rounded down, which causes issues
        let buttonRect1 = this.buttonRef1.current.getBoundingClientRect();
        let buttonRect2 = this.buttonRef2.current.getBoundingClientRect();

        let button1Width = buttonRect1.width;
        let button1Height = buttonRect1.height;
        let button2Width = buttonRect2.width;
        let button2Height = buttonRect2.height;

        let buttonDimensions = {
            width: Math.max(button1Width, button2Width),
            height: Math.max(button1Height, button2Height)
        }

        this.setState({
            buttonDimensions: buttonDimensions
        });
    }

    /**
     * Sends the results of a vote to the server.
     * @param {number} result Vote result. 1 for left Pokemon winning, 2 for right Pokemon winning, and 0 for tie.
     */
    selectOption(result) {
        this.setState({
            selected: true
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
        return (
            <>
                <tr>
                    <td className={'main-section-header ' + this.state.statClass1 + (this.state.selected ? ' visible' : ' invisible')}>
                        {this.props.pokemon1.stats[this.props.index]['base_stat']}
                    </td>
                    <td className='main-section-header center-column'>...{this.props.name}?</td>
                    <td className={'main-section-header ' + this.state.statClass2 + (this.state.selected ? ' visible' : ' invisible')}>
                        {this.props.pokemon2.stats[this.props.index]['base_stat']}
                    </td>
                </tr>
                <tr>
                    <td className='main-section-header line-break'>
                        <button id = {'button-' + this.props.index + '-1'} ref={this.buttonRef1} onClick={() => {this.selectOption(1)}} disabled={this.state.selected}
                            style={{width: this.state.buttonDimensions.width, height: this.state.buttonDimensions.height}}
                        >
                            {this.props.pokemon1.name}
                        </button>
                    </td>
                    <td className='main-section-header line-break center-column'>
                        <button id = {'button-' + this.props.index + '-unsure'} onClick={() => {this.selectOption(0)}} disabled={this.state.selected}>
                            I'm not sure
                        </button>
                    </td>
                    <td className='main-section-header line-break'>
                        <button id = {'button-' + this.props.index + '-2'} ref={this.buttonRef2} onClick={() => {this.selectOption(2)}} disabled={this.state.selected}
                            style={{width: this.state.buttonDimensions.width, height: this.state.buttonDimensions.height}}
                        >
                            {this.props.pokemon2.name}
                        </button>
                    </td>
                </tr>
            </>
        );
    }
}