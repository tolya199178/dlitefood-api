'use strict';

var controller = require('./merchant_group.controller');
var express = require('express');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');


var router = express.Router();

router.get('/', auth.hasPermission('MERCHANT_MANAGEMENT', 'READ'), controller.index);
router.put('/:id', auth.hasPermission('MERCHANT_MANAGEMENT', 'UPDATE'), controller.update);

module.exports = router;