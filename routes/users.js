const mongoose = require('mongoose');
require('dotenv').config();
const plm = require('passport-local-mongoose');


const Connection = async () => {
  const URL = process.env.DB_CONNECTION_STRING;

  try {
    await mongoose.connect(URL);
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to the database', error);
  }
};

Connection();


const userSchema = mongoose.Schema({
  username:{
    type: String,
        unique: true,
        required: true,
        trim: true, 
        validate: {
            validator: function(value) {
                return !/\s/.test(value);
            },
            message: 'Username must not contain spaces'
        }
  },
  fullname: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  contact:{
    type:String, 
    unique:true,
    validate: {
    validator: function(v) {
      return /^([0-9]{10}$)/.test(v);
    }},
    required: true
    },
    contactTwo:{
      type:String
    },
    contactThree:{
      type:String
    },
  city:{
    type: String
  },
  profileImage:{
    type:String,
    default:"https://images.assetsdelivery.com/compings_v2/apoev/apoev1811/apoev181100196.jpg"
  },
  address: {
    type: String,
  },
  password: {
    type: String
  },
  totalItems:{
    type:Number,
    default:0
  },
  totalAmount:{
    type:Number,
    default:0
  },
  role:{
    type:String,
    default:"customer"
  },
  cart:{
    type:Array,
    default:[]
  },
  wishlist:{
    type:Array,
    default:[]
  },

});


userSchema.plugin(plm);



module.exports = mongoose.model("user", userSchema);