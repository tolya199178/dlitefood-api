var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL,
      enableProof: true
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({
        'facebook.id': profile.id
      },
      function(user, err) {
        if (err) {
          return done(err);
        }
        console.log('after get info from facebook !!');
        if (!user) {
          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'user',
            username: profile.username,
            provider: 'facebook',
            facebook: profile._json
          });
          user.save(function(err) {
            if (err) return done(err);
            done(err, user);
          });
        } else {
          return done(err, user);
        }
      })
    }
  ));
};
