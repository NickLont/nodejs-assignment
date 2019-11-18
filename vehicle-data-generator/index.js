/*

In this file you will find how we send raw data to other services via nats
There are 2 question points for you to tell us the answer on your presentation
If you're up for it

*/
const csvParse = require('csv-parse')
const fs = require('fs')
const Writable = require('stream').Writable

// NATS Server is a simple, high performance open source messaging system
// for cloud native applications, IoT messaging, and microservices architectures.
// https://nats.io/
// It acts as our pub-sub (https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern)
// mechanism for other service that needs raw data
const NATS = require('nats')

// At this point, do not forget to run NATS server!

// NATS connection happens here
// After a connection is made you can start broadcasting messages (take a look at nats.publish())
const nats = NATS.connect({ json: true })

const results = []
// This function will start reading out csv data from file and publish it on nats
const readOutLoud = (vehicleName) => {
  // Read out meta/route.csv and turn it into readable stream
  const fileStream = fs.createReadStream('./meta/route.csv')
  // =========================
  // Question Point 1:
  // What's the difference betweeen fs.createReadStream, fs.readFileSync, and fs.readFileAsync?
  // And when to use one or the others
  // =========================

  // Now comes the interesting part,
  // Handling this filestream requires us to create pipeline that will transform the raw string
  // to object and sent out to nats
  // The pipeline should looks like this
  //
  //  File -> parse each line to object -> published to nats
  //

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
  // =========================
  // Question Point 2:
  // What would happend if it failed to publish to nats or connection to nats is slow?
  // Maybe you can try to emulate those slow connection
  // =========================
}

// This next few lines simulate Henk's (our favorite driver) shift
console.log('Henk checks in on test-bus-1 starting his shift...')
readOutLoud('test-bus-1')
  .once('finish', () => {
    console.log('henk is on the last stop and he is taking a cigarrete while waiting for his next trip')
    setTimeout(() => readOutLoudReverse('test-bus-1'), 3000)
  })
// To make your presentation interesting maybe you can make henk drive again in reverse

const readOutLoudReverse = async (vehicleName) => {
  console.log('And now he is going in reverse!')
  let i = 0
  results.reverse()
  for (result of results) {
    i++
    if ((i % 100) === 0 && i !==0) { console.log(`vehicle.test-bus-1 sent have sent ${i} messages`) }
    await new Promise((resolve) => { setTimeout(resolve, Math.ceil(Math.random() * 150)) });
    nats.publish('vehicle.test-bus-1', result)    
  }
}
