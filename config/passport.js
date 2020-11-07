const LocalStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Load the necessary models
const Admin = require("../models/Admin"); // Admin Model


module.exports = function (passport) {
  passport.use(
    "local",
    new LocalStrategy({ usernameField: "email" }, function (
      email,
      password,
      done
    ) {
      Admin.findOne({ adminEmail: email })
        .then((admin) => {
          if (!admin) {
            // No user registered with the entered email
            return done(null, false, {
              message: "The email entered isn't registered",
            });
          }
          // Match Password
          bcrypt.compare(password, admin.adminPassword, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
              return done(null, admin);
            } else {
              return done(null, false, { message: "Incorrect Password" });
            }
          });
        })
        .catch((err) => console.log(err));
    })
  );

  passport.serializeUser(function (admin, done) {
    done(null, admin.id);
  });

  passport.deserializeUser(function (id, done) {
    Admin.findById(id, function (err, admin) {
      done(err, admin);
    });
  });
};
