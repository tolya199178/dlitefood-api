'use strict';

var express = require('express');
var controller = require('./customers.controller.js');
var auth  = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasPermission('STAFF_MANAGEMENT', 'READ'), controller.index);
router.post('/', controller.create);

module.exports = router;
