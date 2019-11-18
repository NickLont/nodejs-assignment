import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ReactSpeedometer from 'react-d3-speedometer'

class Speedometer extends Component {
    static propTypes = {
      speed: PropTypes.number,
      title: PropTypes.string
    }

    static defaultProps = {
      speed: 0
    }

    render () {
      const { speed, title } = this.props

      return (
        <div className="c-speedometer">
          <p>{title}</p>
          <ReactSpeedometer
            minValue={0}
            maxValue={120}
            needleHeightRatio={0.7}
            maxSegmentLabels={4}
            segments={2}
            value={speed}
            startColor={'rgb(64, 207, 49)'}
            currentValueText={'${value} km / h'}
            width={200}
            height={150}
            labelFontSize={'12px'}
          />
        </div>
      )
    }
}

export default Speedometer
