var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
  var Users =  sequelize.define('Users', { 
    id: {
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isValidateEmail: function(email) {
          if (email.length < 9) {
            throw new Error("Please choose a longer email !")
          }
        }
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    password: {
      type: DataTypes.VIRTUAL,
      set: function(val) {
        this._password = val;
        this.hashedpassword = this.encryptPassword(val);

        // this.setDataValue('password', val); // Remember to set the data value, otherwise it won't be validated
        // this.setDataValue('hashedPassword', this.salt + val);
      },
      get: function() {
        return this._password;
      }
    },
    hashedpassword: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phoneno: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: 1
    },
    role: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'local'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'staff'
    }
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
        Users.belongsTo(models.Roles, {foreignKey: 'role'});
      },
      /**
       * Creates a new user
       * @param {email}
       * @param {phoneno}
       * @param {password}
       * @param {name}
       * @param {role}
       * @param {type}
       * @result {Object} {sucess: true/false, id: 'in success case'}
      */
      createUser: function(userInfo, callback){

        /*
          Check if exist user with email or phoneno
        */
        this.findAll({
          where: {
            email: userInfo.email
          }
        }).then(function(result){
          // exist other account
          if (result.length){
            return callback({success: false, msg: 'Duplicated user with email !!'})
          }

          // no exist - can create user info
          this.create(userInfo)
          .then(function(user) {
            if (!user) callback({ sucess: false, msg: 'Unknow issue - Can\'t create user ' });
            callback({success: true, user: user});
          })
          .catch(function(exception){
            return callback({success: false, msg: exception.toString()});
          });

        });
      },

      updateUser: function(userInfo, callback){
        this.update(userInfo, {
          where: {
            id: userInfo.id
          }
        }).then(function(result){
          if (!result) callback({ sucess: false, msg: 'Unknow issue - Can\'t create user ' });
          callback({success: true});
        })
        .catch(function(exception){
          return callback({success: false, msg: exception.toString()});
        });;
      }
    },
    instanceMethods: {
      /**
       * Authenticate - check if the passwords are the same
       *
       * @param {String} plainText
       * @return {Boolean}
       * @api public
       */
      authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashedpassword;
      },

      /**
       * Encrypt password
       *
       * @param {String} password
       * @return {String}
       * @api public
       */
      encryptPassword: function(password) {
        if (!password) return '';
        var md5 = crypto.createHash('md5');
        md5.update(password);
        return md5.digest('hex');
      }
    }
  });
  
  return Users;
};
