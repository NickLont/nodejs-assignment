## Setup instructions

If you have Docker Engine installed locally, you can run the following composer command in your shell regardless of which operating system you are using:

```
git clone https://github.com/NickLont/nodejs-assignment.git
cd nodejs-assignment
docker-compose build
docker-compose up
```
If not install from: https://docs.docker.com/install/

`.env.sample` file needs to be renamed to `.env` and be given valid values

## Usage

Going to the `vehicle-data-generator` folder and running `npm run start-broadcast` will start 
to push data to NATS (the pub-sub service).
It will broadcast the data of a full bus route, plus the route in reverse.

The data broadcasted are watched by the Node server and then are stored in a MongoDb database locally.
The results can be viewed with a GUI accessing localhost:27017.

#### The measurements stored are exposed through a REST Api:

- `http://localhost:3002/vehicles/all` returns all unique vehicles with their name and id
- `http://localhost:3002/measurements` returns measurements by Vehicle. It takes multiple query parameters 
like date range, vehicle selection by name or id and pagination.
- `http://localhost:3002/measurements/statistics` returns aggregated statistics per vehicle with optional date range. Right now,
the only aggregation metric is for speed, for which we get the minimum, maximum and average.

#### The measurements are also exposed through a Web Socket:

As soon as the server receives data from NATS, it then exposes them through a Web Socket.
A visual representation of these measurements can be seen by visiting `http://localhost:3010/`.
As soon as the data starts comming in (by broadcasting from the data generator), we will be able to see the position of the bus, plus more information in real time.

#### The incidents db

Following the requirements, when an incident occurs (for testing purposes, i decided that an incident occurs when a bus has less than 20% battery level, or has speed more than 60 hm/h) it needs to be stored in a separate 
database handled by a different service. The server handling this is the `incidents-server` and the results are stored in another (remote) database located at `mlab.com`.

#### Testing

To run tests, inside the `/server` folder run `npm run test`. 
This will run tests checking the servers availability and the endpoints. It uses `Jest`, `supertest` and `mongo-memory-server`

#### Architecture

![](https://github.com/NickLont/nodejs-assignment/blob/master/architecture.jpg)
