import React, {Component} from 'react'
import PropTypes from 'prop-types'

class MapMarker extends Component {
    static props = {
        name: PropTypes.number,
        vehicleName: PropTypes.number,
        color: PropTypes.object
    }
    static defaultProps = {
        name: '',
        vehicleName: '',
        color: 'blue'
    }

    // <p className="c-map-marker__label">{vehicleName}</p>
    render () {
        const { name, color, vehicleName} = this.props
        return (
            <>
                <div className="c-map-marker c-map-marker__bounce" style={{backgroundColor: color}} name={name}></div>
                <div className="c-map-marker__pulse"></div>
                <p className="c-map-marker__label">{vehicleName}</p>
            </>
        )
    }
}

export default MapMarker
