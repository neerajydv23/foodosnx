var express = require('express');
var router = express.Router();
const userModel = require("./users");
const productModel = require("./products");
const passport = require("passport");
const localStrategy = require('passport-local');
require('dotenv').config();

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

passport.use(new localStrategy(userModel.authenticate()));


/* GET home page. */
router.get('/', async function (req, res, next) {
  const admin = await userModel.findOne({ role: 'admin' });
  const products = await productModel.find({});
  res.render('index', { admin, products });  //passing admin to display its contact dets
});
router.get('/adminDashboard', isAdmin, async function (req, res, next) {
  const allUsers = await userModel.find({});
  res.render('adminDashboard', { allUsers });
});
router.get('/manageContactDetails', isAdmin, async function (req, res) {
  const admin = await userModel.findOne({ role: 'admin' });
  res.render('manageContactDetails', { admin });
});
router.post("/manageContactDetails", isAdmin, async function (req, res) {
  const admin = await userModel.findOneAndUpdate(
    { role: 'admin' },
    {
      username: req.body.username,
      fullname: req.body.fullname,
      email: req.body.email,
      contact: req.body.contact,
      contactTwo: req.body.contactTwo,
      contactThree: req.body.contactThree,
      address: req.body.address,
    },
    { new: true }
  );

  await admin.save();
  res.redirect('/adminDashboard');
});
router.get('/addProducts', isAdmin, function (req, res, next) {
  res.render('addProducts');
});
router.post('/addProducts', isAdmin, async function (req, res, next) {
  const product = req.files.productImage;
  cloudinary.uploader.upload(product.tempFilePath, async function (err, result) {
    if (err) return next(err);
    const newProduct = new productModel({
      productName: req.body.productName,
      productPrice: req.body.productPrice,
      productImage: result.secure_url,
    });
    await newProduct.save();
    req.flash('success', 'Product created successfully');
    res.redirect('/manageProducts');
  })
});
router.get('/manageProducts', isAdmin, async function (req, res, next) {
  try {
    const products = await productModel.find({});

    // Pass flash messages to the template
    const successMessage = req.flash('success');
    const errorMessage = req.flash('error');

    res.render('manageProducts', { products, successMessage, errorMessage });
  } catch (error) {
    console.error("Error fetching products:", error);
    req.flash('error', 'Failed to fetch product data');
    res.redirect('/adminDashboard'); // Redirect to a suitable page in case of error
  }
});

router.get('/deleteProduct/:id', isAdmin, async function (req, res, next) {
  try {
    const product = await productModel.findById(req.params.id);

    // Delete the image from Cloudinary
    const imageURL = product.productImage;
    const publicID = imageURL.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(publicID);

    // Delete the product from the database
    await productModel.findByIdAndDelete(req.params.id);

    // Set flash message
    req.flash('success', 'Product deleted successfully');

    res.redirect('/manageProducts');
} catch (error) {
    console.error("Error deleting product:", error);
    req.flash('error', 'Failed to delete product');
    res.redirect('/manageProducts');
}
});

router.get('/editProduct/:id', isAdmin, async function (req, res, next) {
  const product = await productModel.findById(req.params.id);
  res.render('editProduct', { product });
});
router.post('/editProduct/:id', isAdmin, async function (req, res, next) {
  try {
    const product = await productModel.findByIdAndUpdate(req.params.id, {
      productName: req.body.productName,
      productPrice: req.body.productPrice
    }, { new: true });
    await product.save();

    // Set flash message
    req.flash('success', 'Product details updated successfully');

    res.redirect('/manageProducts');
  } catch (error) {
    // Handle error appropriately
    console.error("Error updating product:", error);
    req.flash('error', 'Failed to update product details');
    res.redirect('/manageProducts');
  }
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
