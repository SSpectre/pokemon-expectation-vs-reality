import React from 'react';

/**
 * A component for a simple loading animation
 * @memberof module:pokemon-expectation-vs-reality/client
 */
class LoadingScreen extends React.Component {
    constructor(props) {
		super(props);

		this.state = {
			ellipsis: '',
            interval: null
		}

        this.updateEllipsis = this.updateEllipsis.bind(this);
	}

    componentDidMount() {
        let interval = setInterval(this.updateEllipsis, 333);

        this.setState({
            interval: interval
        });
    }

    componentWillUnmount() {
        clearInterval(this.state.interval);
    }

    /**
     * Interval handler function for incrementing periods and reverting them to zero
     */
    updateEllipsis() {
        let ellipsis = this.state.ellipsis;

        if (ellipsis.length > 3) {
            ellipsis = '';
        } else {
            ellipsis = ellipsis + '.';
        }

        this.setState({
            ellipsis: ellipsis
        });
    }

    render() {
        return (
            <div className='loading'>
                <div className='loading-container'>
                    <h1>{'Loading' + this.state.ellipsis}</h1>
                </div>
            </div>
        );
    }
}

export default LoadingScreen;