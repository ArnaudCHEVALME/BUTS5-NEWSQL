const Influx = require('influx');
const moment = require('moment-timezone');

const client = new Influx.InfluxDB({
  database: 'newsql_db',
  host: 'localhost',
  port: 8086,
  schema: [
    {
      measurement: 'login_times',
      fields: {
        displayName: Influx.FieldType.STRING,
      },
      tags: [
        'userId', 'googleId'
      ]
    }
  ]
});

module.exports = app => {
  app.get('/api/logins', async (req, res) => {
    try {
      const logs = await client.query(`SELECT * FROM login_times ORDER BY time DESC tz('Europe/Paris')`)
      res.status(200).send(logs);
    } catch (error) {
      res.status(500).send("Internal server error");
      console.log(error);
    }
  });

  app.get('/api/logins/:minutes', async (req, res) => {
    const minutes_slice = req.params.minutes ? req.params.minutes + "m" : "10m";

    try {
      const logs = await client.query(`SELECT COUNT(displayName) FROM login_times WHERE time > now() - 60m GROUP BY time(${minutes_slice}) ORDER BY time DESC tz('Europe/Paris')`)

      logs.forEach(log => log.time = moment(log.time).format('HH:mm'));

      res.status(200).send(logs);
    } catch (error) {
      res.status(500).send("Internal server error");
      console.log(error);
    }
  });
}
