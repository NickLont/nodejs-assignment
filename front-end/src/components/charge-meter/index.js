import React, {Component} from 'react'
import ReactSpeedometer from "react-d3-speedometer"
import PropTypes from 'prop-types';

class ChargeMeter extends Component {
    static propTypes = {
        energy: PropTypes.number,
        title: PropTypes.string
    }
    static defaultProps = {
        energy: 0
    }

    render() {
        const {title} = this.props
        const energy = this.props.energy.toFixed(1)
        return (
            <div className="c-charge-meter">
            <p>{title}</p>
            <ReactSpeedometer
                minValue={0}
                maxValue={100}
                needleHeightRatio={0.7}
                maxSegmentLabels={4}
                segments={1000}                    
                value={energy}
                currentValueText={'${value} %'}
                // fluidWidth
                width={200}
                height={150}
                labelFontSize={'12px'}
            />
        </div>
        )
    }
}

export default ChargeMeter