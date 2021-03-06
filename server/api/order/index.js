'use strict';

var express = require('express');
var controller = require('./order.controller');

var router = express.Router();

router.post('/', controller.create);
router.get('/orderStartStop', controller.calculateOrderStartStopPosition);
module.exports = router;