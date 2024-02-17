var express = require('express');
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");
const localStrategy = require('passport-local');

passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index');
});
router.get('/adminDashboard', isLoggedIn, async function (req, res, next) {
  const allUsers = await userModel.find({});
  res.render('adminDashboard', { allUsers });
});
router.get('/login', function (req, res, next) {
  res.render('login', { error: req.flash('error') });
});
router.get('/register', function (req, res, next) {
  res.render('register', { error: req.flash('error') });
});

router.post('/register', function (req, res, next) {

  const userData = new userModel({
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
    contact: req.body.contact
  });

  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/");
      })
    })
    .catch(function (err) {
      // Handle registration failure (e.g., username/email already taken)
      req.flash('error', 'Registration failed. Please choose a different username or email.');
      console.log(err);
      res.redirect('/register');
    });
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true
}), function (req, res) {
  if (req.user.role === 'admin') {
    res.redirect('/adminDashboard');
  } else {
    res.redirect('/');
  }
});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

module.exports = router;
