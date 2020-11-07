const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const fileupload = require("express-fileupload");
const flash = require("connect-flash");
const passport = require("passport");
const session = require("express-session");
const app = new express();

// Require MongoDb URI
const db = require("./config/db_config").MongoURI;
require("./config/passport")(passport);

mongoose.connect(
  db,
  { useNewUrlParser: true, useUnifiedTopology: true },
  function (err, connected) {
    if (connected) {
      console.log("MongoDB connected");
    } else {
      console.log("MongoDb not connected");
    }
  }
);

// Setting up the View Engine
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

// Express Session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());


// File Upload Middleware
app.use(fileupload());

// Connect Flash Middleware
app.use(flash());

// Global Variables
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.upload_msg = req.flash("upload_msg");
  res.locals.error = req.flash("error");
  next();
});

// Require the routes
const index = require("./routes/index");
const admin = require("./routes/admin");

// Serving Static content
app.use(express.static(path.join(__dirname, "public")));

// System Routes
app.use("/", index);
app.use("/", admin);

app.use(function(req, res, next){
  res.status(404).render("top-navigations/resources/notFound", {
    error_msg: "Ooooops..... The page could not be found",
  })
})

// Launch the server
const PORT = process.env.PORT || 7000;
app.listen(PORT, function () {
  console.log(`Server running on PORT ${PORT}`);
});