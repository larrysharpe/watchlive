'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.post('/verify', controller.verifyEmail);
router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.get('/resendVerification/:id', controller.resendVerification);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);
router.post('/accountHelp', controller.accountHelp);
router.post('/passwordReset', controller.passwordReset);
router.get('/:id', auth.isAuthenticated(), controller.show);

module.exports = router;
