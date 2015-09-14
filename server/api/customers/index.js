'use strict';

var express = require('express');
var controller = require('./customers.controller.js');
var auth  = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasPermission('CUSTOMER_MANAGEMENT', 'READ'), controller.index);
router.post('/signup', controller.create);
router.get('/verifyemail', controller.verifyEmail);

module.exports = router;
