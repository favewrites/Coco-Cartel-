const express = require('express');
const router = express.Router();
const Wishlist = require('../models/Wishlist');
const { authMiddleware } = require('../middleware/auth');

// Get user's wishlist
router.get('/', authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.userId })
      .populate('products');
    
    if (!wishlist) {
      return res.json({ products: [] });
    }
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add to wishlist
router.post('/add/:productId', authMiddleware, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({
        user: req.user.userId,
        products: [req.params.productId]
      });
    } else {
      if (!wishlist.products.includes(req.params.productId)) {
        wishlist.products.push(req.params.productId);
      }
    }
    
    wishlist.updatedAt = Date.now();
    await wishlist.save();
    
    res.json({ message: 'Added to wishlist', wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove from wishlist
router.delete('/remove/:productId', authMiddleware, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.userId });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.products = wishlist.products.filter(
      id => id.toString() !== req.params.productId
    );
    
    wishlist.updatedAt = Date.now();
    await wishlist.save();
    
    res.json({ message: 'Removed from wishlist', wishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Move to cart (remove from wishlist, add to cart)
router.post('/move-to-cart/:productId', authMiddleware, async (req, res) => {
  try {
    const Cart = require('../models/Cart');
    
    // Remove from wishlist
    const wishlist = await Wishlist.findOne({ user: req.user.userId });
    if (wishlist) {
      wishlist.products = wishlist.products.filter(
        id => id.toString() !== req.params.productId
      );
      await wishlist.save();
    }
    
    // Add to cart
    let cart = await Cart.findOne({ user: req.user.userId });
    
    if (!cart) {
      cart = new Cart({
        user: req.user.userId,
        items: [{ product: req.params.productId, quantity: 1 }]
      });
    } else {
      const itemIndex = cart.items.findIndex(
        item => item.product.toString() === req.params.productId
      );
      
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += 1;
      } else {
        cart.items.push({ product: req.params.productId, quantity: 1 });
      }
    }
    
    await cart.save();
    
    res.json({ message: 'Moved to cart' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;