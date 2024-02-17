var express = require('express');
var router = express.Router();
const userModel = require("./users");
const passport = require("passport");
const localStrategy = require('passport-local');

passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/', async function (req, res, next) {
  const admin = await userModel.findOne({role: 'admin'});
  res.render('index',{admin});  //passing admin to display its contact dets
});
router.get('/adminDashboard', isAdmin, async function (req, res, next) {
  const allUsers = await userModel.find({});
  res.render('adminDashboard', { allUsers });
});
router.get('/manageContactDetails', isAdmin, async function(req, res) {
  const admin = await userModel.findOne({role: 'admin'});
  res.render('manageContactDetails', {admin});
});
router.post("/manageContactDetails",isAdmin, async function(req,res){
  const admin = await userModel.findOneAndUpdate(    
    {role: 'admin'},
    {username: req.body.username, 
    fullname:req.body.fullname,
    email:req.body.email,
    contact:req.body.contact,
    contactTwo: req.body.contactTwo,
    contactThree: req.body.contactThree,
    address:req.body.address,
  },
    {new: true}
    );

    await admin.save();
    res.redirect('/adminDashboard');
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

function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.redirect('/login');
}

module.exports = router;
