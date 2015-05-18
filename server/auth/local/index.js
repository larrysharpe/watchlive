'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return res.json(401, error);
    if (!user) return res.json(404, {message: 'Something went wrong, please try again.'});
    user.lastLogin = new Date();
    user.save(function (err, user){

      var roleSign = user.roles.join('');

      if(err)  {
        res.send(500);
      } else {
        var resObj = {
          roles: user.roles,
          token: auth.signToken(user._id, roleSign)
        };
        res.json(resObj);
      }
    });
  })(req, res, next)
});

module.exports = router;
