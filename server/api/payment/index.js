'use strict';

var express = require('express');
var controller = require('./payment.controller');

var router = express.Router();
console.log('----------');
router.post('/', controller.create);
module.exports = router;
