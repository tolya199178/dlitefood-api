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

  facebook: {
    clientID: '1627718797477717',
    clientSecret: 'd6ac2f52ed13724f5da5eb546372e7a8',
    callbackURL: 'http://localhost:9001/auth/facebook/callback'
  },

  // Amazon Web Service Config. Details
  aws: {
   userName: "dliteme_dev",
   pwd: "Justme11",
   signInLink: "https://071248920477.signin.aws.amazon.com/console",
   accessKeyID: "AKIAJM7GKN24A3TVSUYA",
   secretAccessKey: "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"
  },

  userRoles: ['staff', 'supervisor', 'user', 'admin'],

  paypal:{
    'mode': 'sandbox', //sandbox or live
    'endpoint'     : 'api.sandbox.paypal.com',
    'client_id'    : 'Ad8-fTJ6gOTl-ynysgeuLvpUA_-Jjggl37uR83YPvWUeuVFMIfYi8GwOtsOnlddpwVsn0ZCm6i1TVE9h',//'ASfj4D8bWWrGBKOuOdoyES2uY6yyXalvKi1JoB0XvlczbsGvxBBLNZs5O0gZJWoVMOmgQUrKqMb5GsIM',
    'client_secret': 'EKFPnntWwkLzsU4hcHDpZMN8Hi7eSg-QgYF18dflaeq7kRrrErdJFimAD6xNCvRuGlDTBAdHtCj78iZY',//'EPYecaOXZAixTw8HL9-WV4SlhFlqcJSdBYTRc7f6FDvuz2mqwBMpe4JiulcDsZqXuIyMmRucskNIqOig',

    "redirect_urls": {
      "return_url": "http://localhost:9000/#!/checkout/confirm", // https://dliteme.com/api/payments/confirm
      "cancel_url": "http://localhost:9000/#!/checkout/info"   // https://dliteme.com/api/payments/cancel
    }

  },

  redis: {
    host: "localhost",
    port: 6379
  },

  // AWS S3 Config

  aws_s3: {
    userName: 'dlitedev',
    pwd: '5j|*#4}V[[8L',
    signinLink: 'https://071248920477.signin.aws.amazon.com/console'
  },

  // Braintree

  braintree: {
    merchantId: 'nh9m54ms22rfpw8c',
    publicKey: 'y7dscxmdzwkvc8hy',
    privateKey: 'a960690fd9f48aeed0bd855dc5106ef3'
  }

};
