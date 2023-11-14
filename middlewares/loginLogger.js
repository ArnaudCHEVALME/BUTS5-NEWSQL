const Influx = require('influx');

module.exports = async (req, res, next) => {
  console.log(req.user);

  const { _id, googleId, displayName } = req.user;

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

  try {
    await client.writePoints([
      {
        measurement: 'login_times',
        tags: { userId: _id, googleId },
        fields: { displayName },
        timestamp: new Date()
      }
    ]);
  } catch (err) {
    console.error("Erreur écriture : ", err);
  }

  next();
}