import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Speedometer } from '../../components'
import { ChargeMeter } from '../../components'
import { TextIndication } from '../../components'
import { MapIndication } from '../../components'


class IndicationsPanel extends Component {
    static propTypes = {
        currentMeasurements: PropTypes.object
    }
    static defaultProps = {
        currentMeasurements: {}
    }

    render () {
        const {currentMeasurements} = this.props
        const energy = currentMeasurements.energy ? currentMeasurements.energy.toFixed(2) : 0
        const odo = currentMeasurements.odo ? currentMeasurements.odo.toFixed(2) : 0
        const lat = (currentMeasurements.gps && currentMeasurements.gps.length > 1) ? Number(currentMeasurements.gps[0]) : 0
        const lon = (currentMeasurements.gps && currentMeasurements.gps.length > 1) ? Number(currentMeasurements.gps[1]) : 0
        const center = (lat !==0 && lon !==0) ? { lat: lat, lng: lon }: undefined
        
        return (
            <div className="c-indications-panel">
                <div className="c-indications-panel__top-container">
                    <div className="c-indications-panel__left-container">
                        <Speedometer speed={currentMeasurements.speed} title={'Current Speed'} />
                        <ChargeMeter energy={currentMeasurements.soc} title={'Charge level'} />
                    </div>
                    <div className="c-indications-panel__right-container">
                        <TextIndication indication={'Energy'} value={energy} unit={'kW'} />
                        <TextIndication indication={'Odometer'} value={odo} unit={'km'} />
                    </div>
                </div>
                <MapIndication lat={lat} lon={lon} center={center} zoom={15} vehicleName={currentMeasurements.vehicle} />
            </div>
        )
    }
}

export default IndicationsPanel