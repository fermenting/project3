//encrypts Oauth keys
require("dotenv").config();
const passport = require("passport");
const LocalStrategy = require("passport-local");
// const GoogleStrategy = require("passport-google-oauth20");
// const FacebookStrategy = require("passport-facebook");
// const MeetupStrategy = require('passport-meetup').Strategy;
const keys = require("../keys.js");
const db = require("../models");
//middleware to encrypt passwords
const bCrypt = require("bcrypt-nodejs");

// Passport session setup
passport.serializeUser(function(user, done) {
    console.log("user",user,"done", done)
    if (user[0]) {
    console.log("serialize[0]" + user[0]._id);
    done(null, user[0]._id);
    } else {
        console.log("serialize" + user._id);
        done(null, user._id);
    }
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    console.log("deserialize" + id);
    db.User.findById(id).then(function(user) {
        if (user) {
            console.log("deserialize", user)
            done(null, user);
        } else {
            done(user[0].errors, null);
        }
    });
});

//passport config for local signup
passport.use('local-signup', new LocalStrategy({
        usernameField: 'userName',
        passwordField: 'password',
        passReqToCallback: true
    },
    function(req, userName, password, done) {
        process.nextTick(function() {
            db.User.find({
                userName: userName
            }).then(function(user) {
                if (user.length > 0) {
                    console.log('signupMessage', 'That username is already taken.');
                    
                    return done(null, false, { message: 'That username is already taken.' });
                } else {
                    const userPassword = generateHash(req.body.password);
                    const newUser = {
                        userName: req.body.userName,
                        // email: req.body.email,
                        password: userPassword,
                        authMethod: "local"
                    }
                    db.User.create(newUser).then(function(dbUser, created) {
                        if (!dbUser) {
                            return done(null, false);
                        } else {
                            return done(null, dbUser);
                        }
                    })
                }
            });

        });
    }
));

//passport config for local signin
passport.use('local-signin', new LocalStrategy({
        usernameField: 'userName',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    function(req, userName, password, done) {

        const isValidPassword = function(userpass, password) {
            return bCrypt.compareSync(password, userpass);
        }

        db.User.find({
                userName: userName
        }).then(function(user) {
            console.log("user", user[0])
            if (user[0].length <= 0) {
                console.log("'Username does not exist'")
                return done(null, false, {
                    message: 'Username does not exist'
                });
            }
            if (!isValidPassword(user[0].password, password)) {
                console.log("yo?")
                return done(null, false, {
                    message: 'Incorrect password.'
                });
            }
            return done(null, user);


        }).catch(function(err) {
            console.log("Error:", err);
            return done(null, false, {
                message: 'Something went wrong with your Signin'
            });
        });
    }
));

//passport config for google signin
// passport.use(new GoogleStrategy({
//         clientID: keys.google.clientID,
//         clientSecret: keys.google.clientSecret,
//         callbackURL: "/auth/google/callback"
//     }, function(accessToken, refreshToken, profile, done) {
//         console.log("Email" + profile.emails[0].value);
//         console.log("ID: " + profile.id);
//         console.log("Display name: " + profile.displayName);
//         console.log("given name" + profile.name.givenName);
//         console.log("google passport callback");

//         //done(null, { id: profile.id });
//         process.nextTick(function() {
//             User.findOne({
//                 where: {
//                     socialID: profile.id
//                 }
//             }).then(function(user) {
//                 if (user) {
//                     console.log('Already signed in.');
//                     return done(null, user);
//                 } else {
//                     User.create({
//                         userName: profile.displayName,
//                         firstName: profile.name.givenName,
//                         lastName: profile.name.familyName,
//                         email: profile.emails[0].value,
//                         authMethod: "google",
//                         socialID: profile.id

//                     }).then(function(dbUser, created) {
//                         if (!dbUser) {
//                             return done(null, false);
//                         } else {
//                             console.log(dbUser.dataValues);
//                             return done(null, dbUser);
//                         }
//                     })
//                 }


//             })
//         });
//     }
// ));

// //passport config for facebook signin
// passport.use(new FacebookStrategy({
//     clientID: keys.facebook.appID,
//     clientSecret: keys.facebook.appSecret,
//     callbackURL: "/auth/facebook/callback",
//     profileFields: ["id", "displayName", "email", "first_name", "last_name"]
// }, function(accessToken, refreshToken, profile, done) {
//     console.log(profile);
//     console.log("ID: " + profile.id);
//     console.log("Display name: " + profile.displayName);
//     console.log("fb passport callback");


//     process.nextTick(function() {
//         User.findOne({
//             where: {
//                 socialID: profile.id
//             }
//         }).then(function(user) {
//             if (user) {
//                 console.log('signupMessage', 'That email is already taken.');
//                 return done(null, user);
//             } else {
//                 User.create({
//                     userName: profile.displayName,
//                     firstName: profile.name.givenName,
//                     lastName: profile.name.familyName,
//                     email: profile.emails[0].value,
//                     authMethod: "facebook",
//                     socialID: profile.id

//                 }).then(function(dbUser, created) {
//                     if (!dbUser) {
//                         return done(null, false);
//                     } else {
//                         console.log(dbUser.dataValues);
//                         return done(null, dbUser);
//                     }
//                 })
//             }
//         })
//     });

// }));


// // Use the MeetupStrategy within Passport.
// //   Strategies in passport require a `verify` function, which accept
// //   credentials (in this case, a token, tokenSecret, and Meetup profile), and
// //   invoke a callback with a user object.
// passport.use(new MeetupStrategy({
//     consumerKey: keys.meetup.consumerKey,
//     consumerSecret: keys.meetup.consumerSecret,
//     callbackURL: "/auth/meetup/callback"
//   },
//   function(token, tokenSecret, profile, done) {
//     console.log(profile);
//     console.log("ID: " + profile.id);
//     console.log("Display name: " + profile.displayName);
//     console.log("meetup passport callback");
//     // asynchronous verification, for effect...
//     process.nextTick(function () {
      
//       // To keep the example simple, the user's Meetup profile is returned to
//       // represent the logged-in user.  In a typical application, you would want
//       // to associate the Meetup account with a user record in your database,
//       // and return that user instead.
//       return done(null, profile);
//     });
//   }
// ));

// //generate hash for password
function generateHash(password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(8), null);
};