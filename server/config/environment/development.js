'use strict';

// Development specific configuration
// ==================================
module.exports = {

  mysql: {
    username: "root",
    password: "anhlavip",
    database: "justfast_food", //"justfast_food",
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false
  },

  cloudinary: {
    cloudName: 'dy4lucetl',
    apiKey: '717335745964917',
    apiSecret: 'rB007wYr1iFDeFgKwfkUykUTBrA',
    env: 'CLOUDINARY_URL=cloudinary://717335745964917:rB007wYr1iFDeFgKwfkUykUTBrA@dy4lucetl'

  },

  facebook: {
    clientID: '1627718797477717',
    clientSecret: 'd6ac2f52ed13724f5da5eb546372e7a8',
    callbackURL: 'http://localhost:9001/auth/facebook/callback'
  },

  userRoles: ['staff', 'supervisor', 'user', 'admin']

};
