const {Client} = require('pg');

var connectStr = process.env.DATABASE_URL || "postgres://ikgames:ikgames@localhost:5432/ikgames";
var client = new Client(connectStr);
client.connect();

module.exports = client;
