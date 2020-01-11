import React, { Component } from 'react'
import ReactSpeedometer from 'react-d3-speedometer'
import PropTypes from 'prop-types'

class ChargeMeter extends Component {
    static propTypes = {
      chargeLevel: PropTypes.number,
      title: PropTypes.string
    }

    static defaultProps = {
      chargeLevel: 0
    }

    render () {
      const { title, chargeLevel } = this.props
      return (
        <div className="c-charge-meter">
          <p>{title}</p>
          <ReactSpeedometer
            minValue={0}
            maxValue={100}
            needleHeightRatio={0.7}
            maxSegmentLabels={4}
            segments={1000}
            value={chargeLevel}
            // eslint-disable-next-line
            currentValueText={'${value} %'}
            width={200}
            height={150}
            labelFontSize={'12px'}
          />
        </div>
      )
    }
}

export default ChargeMeter
