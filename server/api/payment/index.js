'use strict';

var express = require('express');
var controller = require('./payment.controller');

var router = express.Router();
<<<<<<< HEAD

=======
>>>>>>> 387d5324985bcc198def9e248a5f76ca8d938652
router.post('/', controller.create);
router.post('/confirm/', controller.confirm);
module.exports = router;
