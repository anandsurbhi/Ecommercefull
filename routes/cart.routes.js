const express = require('express');
const { isLoggedIn } = require('../middlewares/auth');
const UserModel = require('../models/User.model');
const router = express.Router();

router.get('/user/cart', isLoggedIn, async (req, res) => {
    try {
        const user = await UserModel.findById(req.user._id).populate('cart.productId');
        
        if (!user || !user.cart) {
            return res.status(404).send('User or cart not found');
        }

        let totalPrice = 0;
        for (let item of user.cart) {
            if (item.productId && item.productId.price) {
                totalPrice += item.quantity * item.productId.price;
            } else {
                console.error(`Product or price not found for item: ${JSON.stringify(item)}`);
                // Optionally, you can remove items with null productId here
            }
        }

        res.render('cart/index', { productsInCart: user.cart, totalPrice });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});



router.post('/products/:productId/cart', isLoggedIn, async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;

    const user = await UserModel.findById(userId);
    const existingProduct = user.cart.find(product => product.productId == productId)

    // if (existingProduct){
    //     existingProduct.quantity++;
    // }else{
    //     user.cart.push({ productId });
    // }

    existingProduct ? existingProduct.quantity++ : user.cart.push({ productId })
    await user.save();

    res.redirect('back');
})

router.delete('/products/:productId/cart', isLoggedIn, async (req, res) => {
   try {
        const { productId } = req.params;
        const userId = req.user._id;

        const user = await UserModel.findById(userId);

        const existingProductIndex = user.cart.findIndex((item) => item.productId == productId);
        user.cart.splice(existingProductIndex, 1);
        await user.save();

        res.redirect('back');
   } 
   catch (err) {
        console.log(err);
        res.send('Something Went Wrong!!!')
   }
})

module.exports = router;