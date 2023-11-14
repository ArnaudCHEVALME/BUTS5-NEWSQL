const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  try {
    await next();
    clearHash(req.user.id);
  } catch (err) {
    console.log(err);
  }
}