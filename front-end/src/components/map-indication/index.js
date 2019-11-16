import React, {Component} from 'react'
import GoogleMapReact from 'google-map-react'
import PropTypes from 'prop-types'

import {MapMarker} from '../../components'

class MapIndication extends Component {
    static props = {
        lat: PropTypes.number,
        lon: PropTypes.number,
        zoom: PropTypes.number,
        center: PropTypes.object,
        vehicleName: PropTypes.string
    }
    static defaultProps = {
        defaultCenter: {
          lat: 52.08938980102539,
          lng: 5.1064300537109375
        },
        zoom: 11,
        vehicleName: ''
      }

    render () {
        const {lat, lon, center, zoom, defaultCenter, vehicleName} = this.props
        return (
            <div style={{ height: '40vh', width: '100%' }}>
            <GoogleMapReact
              bootstrapURLKeys={{ key: 'AIzaSyAc_9XrMawnXc9eagPOJGSd6FcEMlQ40UE' }} // TODO put that in the .env file
              defaultCenter={defaultCenter}
              center={center}
              defaultZoom={zoom}
            >
              <MapMarker
                lat={lat}
                lng={lon}
                vehicleName={vehicleName}
              />
            </GoogleMapReact>
          </div>
        )
    }
}

export default MapIndication
