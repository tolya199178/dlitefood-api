/**
 * Broadcast updates to client when the model changes
 */

'use strict';


var models = require('../../models'),
    passport = require('passport'),
    config = require('../../config/environment'),
    jwt = require('jsonwebtoken'),
    _ = require('lodash');

exports.broadcastData = function(event, data){
  GLOBAL.socketio.sockets.emit(event, data);
}