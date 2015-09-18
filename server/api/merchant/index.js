'use strict';

var express = require('express');
var controller = require('./merchant.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');


var router = express.Router();

router.get('/', auth.hasPermission('MERCHANT_MANAGEMENT', 'READ'), controller.index);
router.get('/:id', controller.single);
router.get('/categories/:id', controller.getCategories);
router.put('/:id', auth.hasPermission('MERCHANT_MANAGEMENT', 'UPDATE'), controller.update);
router.delete('/:id', auth.hasPermission('MERCHANT_MANAGEMENT', 'DELETE'), controller.destroy);
router.post('/', auth.hasPermission('MERCHANT_MANAGEMENT', 'CREATE'), controller.create);

module.exports = router;
