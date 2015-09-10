'use strict';

var express = require('express');
var controller = require('./staff.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasPermission('STAFF_MANAGEMENT', 'READ'), controller.index);
// router.get('/activeStaff', auth.hasPermission('STAFF_MANAGEMENT', 'READ'), controller.getActiveStaff);
router.delete('/:id', auth.hasPermission('STAFF_MANAGEMENT', 'DELETE'), controller.destroy);
router.put('/updateStaffInfo/:id', auth.hasPermission('STAFF_MANAGEMENT', 'UPDATE'), controller.update);
router.post('/', auth.hasPermission('STAFF_MANAGEMENT', 'CREATE'), controller.create);
// router.put('/updateLocation', auth.isAuthenticated(), controller.updateLocation);
// router.put('/changeStatus', auth.isAuthenticated(), controller.changeStatus);

module.exports = router;
