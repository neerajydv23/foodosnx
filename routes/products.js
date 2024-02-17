const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productPrice: {
        type: Number,
        required: true
    },
    productImage: {
        type: String,
        required: true
    },
    productType: {
        type: String,
        default: "regular"      // regular, featured, discount
    },
    productCategory: {
        type: String,
        required: true
    },
    
});


module.exports = mongoose.model("product", productSchema);
