const csvParse = require('csv-parse')
const fs = require('fs')
const Writable = require('stream').Writable

const NATS = require('nats')
const nats = NATS.connect({ json: true })

const results = []
// This function will start reading out csv data from file and publish it on nats
const readOutLoud = (vehicleName) => {
  // Read out meta/route.csv and turn it into readable stream
  const fileStream = fs.createReadStream('./meta/route.csv')
  let i = 0

  return (fileStream
  // Filestream piped to csvParse which accept nodejs readablestreams and parses each line to a JSON object
    .pipe(csvParse({ delimiter: ',', columns: true, cast: true }))
    .on('data', (data) => results.push(data))
    // Then it is piped to a writable streams that will push it into nats
    .pipe(new Writable({
      objectMode: true,
      write (obj, enc, cb) {
        // setTimeout in this case is there to emulate real life situation
        // data that came out of the vehicle came in with irregular interval
        // Hence the Math.random() on the second parameter
        setTimeout(() => {
          i++
          if ((i % 100) === 0) { console.log(`vehicle ${vehicleName} sent have sent ${i} messages`) }

          // The first parameter on this function is topics in which data will be broadcasted
          // it also includes the vehicle name to seggregate data between different vehicle
          nats.publish(`vehicle.${vehicleName}`, obj, cb)
        }, Math.ceil(Math.random() * 150))
      }
    })))
}

// This next few lines simulate Henk's shift
console.log('Henk checks in on test-bus-1 starting his shift...')
readOutLoud('test-bus-1')
  .once('finish', () => {
    console.log('henk is on the last stop and he is taking a cigarrete while waiting for his next trip')
    setTimeout(() => readOutLoudReverse('test-bus-1'), 3000)
  })
// make henk drive again in reverse

const readOutLoudReverse = async (vehicleName) => {
  console.log('And now he is going in reverse!')
  let i = 0
  results.reverse()
  for (const result of results) {
    i++
    if ((i % 100) === 0 && i !== 0) { console.log(`vehicle.test-bus-1 sent have sent ${i} messages`) }
    await new Promise((resolve) => { setTimeout(resolve, Math.ceil(Math.random() * 150)) })
    nats.publish(`vehicle.${vehicleName}`, result)
  }
}
