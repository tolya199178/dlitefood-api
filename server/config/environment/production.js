'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            8080,

  mysql: {
    username: "root",
    password: "anhlavip",
    database: "justfast_food",
    host: "127.0.0.1",
    dialect: "mysql",
    autoMigrateOldSchema: true,
    logging: false
  },
  redis: {
    host: "localhost",
    port: 6379
  }
};
