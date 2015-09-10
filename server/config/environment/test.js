'use strict';

// Test specific configuration
// ===========================
module.exports = {
  mysql: {
    username: "root",
    password: "anhlavip",
    database: "justfast_food", //"justfast_food",
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false
  },

  userRoles: ['staff', 'supervisor', 'user', 'admin']
};
