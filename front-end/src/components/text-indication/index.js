import React, {Component} from 'react'
import PropTypes from 'prop-types';

class TextIndication extends Component {
    static propTypes = {
        indication: PropTypes.string,
        value: PropTypes.number,
        unit: PropTypes.string,
    }
    static defaultProps = {
        indication: '',
        value: null,
        unit: ''
    }

    render() {
        const {indication, value, unit} = this.props
        return (
            <div className="c-text-indication">
                <p className="c-text-indication__indication">{indication}</p>
                <p className="c-text-indication__value">{value} {unit}</p>
            </div>
        )
    }
}

export default TextIndication