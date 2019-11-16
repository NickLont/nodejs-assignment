import React, { Component } from 'react'
import { IndicationsPanel } from '../../components'

class Homepage extends Component {
  state = {
    currentMeasurements: {},
    ws: null
  }
  
  componentDidMount() {
    this.connect()
  }

  timeout = 250

  connect = () => {
    // instance of websocket connection 
    const ws = new WebSocket('ws://localhost:3002')
    let connectInterval

    ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected')
      this.setState({ws: ws})
      this.timeout = 250
      clearTimeout(connectInterval)
    }

    ws.onmessage = payload => {
      // listen to data sent from the websocket server
      let data
      if (payload.data[0] === '{') {
        data = JSON.parse(payload.data)
        this.setState({currentMeasurements: data})
      }
    }

    ws.onclose = (e) => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
      console.log(
        `Socket is closed. Reconnect will be attempted in ${Math.min(
            10000 / 1000,
            (this.timeout + this.timeout) / 1000
        )} second.`,
        e.reason
      )
      this.timeout = this.timeout + this.timeout; //increment retry interval
      connectInterval = setTimeout(this.check, Math.min(10000, this.timeout)); //call check function after timeout
    }

    ws.onerror = err => {
      console.error(
          "Socket encountered error: ",
          err.message,
          "Closing socket"
      )

      ws.close()
    }
  }

  check = () => {
    const { ws } = this.state;
    if (!ws || ws.readyState === WebSocket.CLOSED) this.connect() //check if websocket instance is closed, if so call `connect` function.
  }

  render() {
    const {currentMeasurements} = this.state
    return (
      <div className="c-homepage">
        <div className="c-homepage__container">
          <IndicationsPanel currentMeasurements={currentMeasurements} />
        </div>  
      </div>
    )
  }
}

export default Homepage
