'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config/environment');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};

var makeRandomString = function (length){
  if(!length) length = 5;
  var text = "",
    possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < length; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

exports.verifyEmail = function (req, res){
  User.findOne({emailConfirmationToken: req.body.token}, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    user.emailConfirmed = true;
    user.emailConfirmationToken = '';
    user.save(function (err, user) {
      res.send(200);
    });
  });
}


exports.accountHelp = function (req, res) {
  if (!req.body.email) return res.json(422, 'no email address');
  User.findOne({email: req.body.email}, function(err, user) {
    if (user) {
      var resetToken = makeRandomString(16);
      user.resetToken = {token: resetToken, date: Date.now()};
      user.save();
      res.json({resetToken: resetToken, url: '/api/users/reset', full: '/api/users/reset/' + resetToken});
    } else {
      res.json({resetError: 'Could not find user.'})
    }
  });
}

exports.passwordReset = function (req, res){
  User.findOne({"resetToken.token": req.body.token}, function (err, user) {
    if(err !== null) res.json({error:err});
    else if(!user) res.json({error:'User not found.'});
    else {
      user.password = req.body.password;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    }
  });
};

exports.resendVerification = function (req, res, next){
  User.findOne({_id: req.params.id}, 'emailConfirmationToken', function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.send(200);
  });
};

