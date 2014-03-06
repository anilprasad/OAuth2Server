/**
 * Module dependencies
 */

var path     = require('path')
  , passport = require('passport')
  , Account  = require('../models/Account')
  , Token    = require('../models/Token')
  ;


/**
 * Exports
 */

module.exports = function (app) {

  /**
   * Signin and signup routes
   */

  var ui = require('./ui')(app);

  app.get('/signin', ui);
  app.get('/signup', ui);
  app.get('/account', ui);
  app.get('/account/apps', ui);
  app.get('/developer', ui);


  /**
   * Password signup
   */

  app.post('/signup', function (req, res, next) {
    Account.insert(req.body, function (err, account) {
      if (err) { return next(err); }
      passport.authenticate('local', function (err, account, info) {
        req.login(account, function (err) {
          res.json(201, { authenticated: true, account: account });
        });
      })(req, res, next);
    });
  });


  /**
   * Password login
   */

  app.post('/login', function (req, res, next) {
    passport.authenticate('local', function (err, account, info) {
      if (!account) { return res.json(400, { error: info.message }); }
      req.login(account, function (err) {
        res.json({ authenticated: true, account: account });
      });
    })(req, res, next);
  });


  /**
   * Logout
   */

  app.post('/logout', function (req, res) {
    req.logout();
    res.send(204);
  });


  /**
   * Session
   */

  app.get('/session', function (req, res) {
    if (req.user) {
      res.json({ authenticated: true,  account: req.user });
    } else {
      res.json({ authenticated: false });
    }
  });


  /**
   * Session apps
   */

  app.get('/session/apps', app.authenticateUser, function (req, res, next) {
    Account.listApps(req.user._id, function (err, apps) {
      if (err) { return next(err); }
      res.json(apps);
    })
  });


  /**
   * Revoke access
   */

  app.del('/session/apps/:id', app.authenticateUser, function (req, res, next) {
    Token.revoke(req.user._id, req.params.id, function (err, result) {
      if (err) { return next(err); }
      res.send(204);
    });
  });

};
