'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/environment');
var models = require('../models');

// Passport Configuration
require('./local/passport').setup(models.Users, config);

var router = express.Router();

router.use('/local', require('./local'));

module.exports = router;