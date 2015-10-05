'use strict';

var express = require('express');
var controller = require('./payment.controller');

var router = express.Router();

router.post('/', controller.create);
router.post( '/confirm/', controller.confirm );
router.get('/client_token', controller.getToken );

module.exports = router;
