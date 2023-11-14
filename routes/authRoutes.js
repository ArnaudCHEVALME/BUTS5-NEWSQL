const passport = require('passport');

const loginLogger = require('../middlewares/loginLogger');

module.exports = app => {
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    loginLogger,
    (req, res) => {
      res.redirect('http://localhost:3000/blogs');
    }
  );

  app.get('/auth/logout', (req, res) => {
    req.logout();
    res.redirect('http://localhost:3000/');
  });

  app.get('/api/current_user', (req, res) => {
    res.send(req.user);
  });
};
