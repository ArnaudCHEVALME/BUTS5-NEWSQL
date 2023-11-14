const mongoose = require("mongoose");
const redis = require('redis');
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const client = redis.createClient({ url: redisUrl });
let connected = false;

async function connect() {
  try {
    await client.connect();
    connected = true;
  } catch (err) {
    console.error(err);
  }
}

connect();

const exec = mongoose.Query.prototype.exec;
mongoose.Query.prototype.exec = async function () {
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  if (!connected) {
    return exec.apply(this, arguments);
  }

  console.log("IM ABOUT TO RUN A QUERY");

  const query = this.getQuery();
  const collection = this.mongooseCollection.name;
  const key = JSON.stringify({ query, collection });

  const cachedValue = await client.HGET(this.hashKey, key);
  if (cachedValue) {
    console.log("SERVING FROM CACHE");
    const doc = JSON.parse(cachedValue);
    return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc);
  }

  console.log("SERVING FROM MONGODB");
  const result = await exec.apply(this, arguments);
  await client.HSET(this.hashKey, key, JSON.stringify(result));
  await client.expire(this.hashKey, 10);
  return result;
}

mongoose.Query.prototype.cache = async function (options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || "");
  return this;
}

module.exports = {
  async clearHash(hashKey) {
    if (connected) {
      await client.del(JSON.stringify(hashKey));
    }
  }
}