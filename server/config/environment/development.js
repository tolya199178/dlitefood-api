'use strict';

// Development specific configuration
// ==================================
module.exports = {

  mysql: {
    username: "root",
    password: "",
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


  aws : {
   userName: "dliteme_dev",
   pwd: "Justme11",
   signInLink: "https://071248920477.signin.aws.amazon.com/console",
   accessKeyID: "AKIAJM7GKN24A3TVSUYA",
   secretAccessKey: "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"
  },

  userRoles: ['staff', 'supervisor', 'user', 'admin']

};
