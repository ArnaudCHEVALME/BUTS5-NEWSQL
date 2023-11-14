const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const keys = require('../config/keys');
const mg = require("mongoose");
const User = mg.model("User");

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        done(null, user)
    }).catch(err => {
        done(err, null)
    })
});

passport.use(
    new GoogleStrategy(
        {
            callbackURL: 'http://localhost:5000/auth/google/callback',
            clientID: keys.googleClientID,
            clientSecret: keys.googleClientSecret,
            proxy: true
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existing_user = await User.findOne({
                    googleId: profile.id,
                });

                if (existing_user) {
                    done(null, existing_user)
                }

                const user = await new User({
                    googleId: profile.id,
                    displayName: profile.displayName
                }).save()

                done(null, user)
            } catch (error) {
                done(err, null);
            }
        }
    )
);
