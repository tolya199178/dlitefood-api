'use strict';

var express = require('express');
var controller = require('./postcodes.controller');

var router = express.Router();

router.get('/search', controller.search);

module.exports = router;