import React, { useState, useEffect } from 'react'

function Homepage () {
  // const [measurementsNo, setMeasurementsNo] = useState(0)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3002')
    ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('websocket connected')
    }
    ws.onmessage = payload => {
      // listen to data sent from the websocket server
      let data
      if (payload.data[0] === '{') {
        data = JSON.parse(payload.data)
      }
      console.log('data: ', data)
    }
    ws.onclose = (error) => {
      console.log('websocket connection closed: ', error)
    }
    ws.onerror = error => {
      console.log('websocket encountered an error: ', error)
    }
  })
  return (
    <div className="c-homepage">
      <p>Homepage</p>
    </div>
  )
}

export default Homepage
