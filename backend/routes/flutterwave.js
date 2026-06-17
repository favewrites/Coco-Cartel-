// backend/routes/flutterwave.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { authMiddleware } = require('../middleware/auth');

// ============================================
// CONFIGURATION
// ============================================
const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;
const FLW_BASE_URL = 'https://api.flutterwave.com/v3';

// Axios instance with auth header
const flwAPI = axios.create({
  baseURL: FLW_BASE_URL,
  headers: {
    Authorization: `Bearer ${FLW_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

// ============================================
// HELPER FUNCTION
// ============================================
const sendResponse = (res, status, success, message, data = null) => {
  const response = { success, message };
  if (data) response.data = data;
  return res.status(status).json(response);
};

// ============================================
// INITIALIZE PAYMENT
// ============================================
router.post('/initialize-payment', authMiddleware, async (req, res) => {
  try {
    const { amount, email, phone, name, currency = 'NGN', redirect_url } = req.body;

    if (!amount || !email) {
      return sendResponse(res, 400, false, 'Amount and email are required');
    }

    const payload = {
      tx_ref: `TX-${Date.now()}-${req.user.userId}`,
      amount,
      currency,
      redirect_url: redirect_url || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`,
      customer: {
        email,
        phonenumber: phone || '',
        name: name || ''
      },
      customizations: {
        title: 'Coco Cartel Payment',
        description: 'Payment for items in cart',
        logo: 'https://your-logo-url.com/logo.png'
      },
      meta: {
        userId: req.user.userId
      }
    };

    const response = await flwAPI.post('/payments', payload);

    sendResponse(res, 200, true, 'Payment initialized', response.data.data);

  } catch (error) {
    console.error('Flutterwave initialize error:', error.response?.data || error.message);
    sendResponse(res, 500, false, 'Failed to initialize payment', error.response?.data?.message || error.message);
  }
});

// ============================================
// VERIFY PAYMENT
// ============================================
router.get('/verify-payment/:transactionId', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.params;

    const response = await flwAPI.get(`/transactions/${transactionId}/verify`);
    const { data } = response.data;

    if (data.status === 'successful') {
      sendResponse(res, 200, true, 'Payment verified successfully', {
        transactionId: data.id,
        txRef: data.tx_ref,
        amount: data.amount,
        currency: data.currency,
        status: data.status,
        customer: data.customer,
        paymentType: data.payment_type,
        createdAt: data.created_at
      });
    } else {
      sendResponse(res, 400, false, 'Payment not successful', { status: data.status });
    }

  } catch (error) {
    console.error('Flutterwave verify error:', error.response?.data || error.message);
    sendResponse(res, 500, false, 'Failed to verify payment', error.response?.data?.message || error.message);
  }
});

// ============================================
// VERIFY BY TRANSACTION REFERENCE
// ============================================
router.get('/verify-by-reference/:txRef', authMiddleware, async (req, res) => {
  try {
    const { txRef } = req.params;

    const response = await flwAPI.get(`/transactions/verify_by_reference?tx_ref=${txRef}`);

    sendResponse(res, 200, true, 'Payment verified', response.data.data);

  } catch (error) {
    console.error('Verify by reference error:', error.response?.data || error.message);
    sendResponse(res, 500, false, 'Verification failed', error.response?.data?.message || error.message);
  }
});

// ============================================
// WEBHOOK (No auth - called by Flutterwave)
// ============================================
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    const signature = req.headers['verif-hash'];

    if (signature !== process.env.FLW_WEBHOOK_SECRET) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const payload = JSON.parse(req.body);

    switch (payload.event) {
      case 'charge.completed':
        if (payload.data.status === 'successful') {
          console.log('Payment successful:', payload.data);
          // TODO: Update your order in database
        }
        break;
      default:
        console.log('Unhandled event:', payload.event);
    }

    res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).send('OK');
  }
});

// ============================================
// GET ALL TRANSACTIONS
// ============================================
router.get('/transactions', authMiddleware, async (req, res) => {
  try {
    const { from, to, page = 1, status } = req.query;
    let url = `/transactions?from=${from || ''}&to=${to || ''}&page=${page}`;
    if (status) url += `&status=${status}`;

    const response = await flwAPI.get(url);

    sendResponse(res, 200, true, 'Transactions retrieved', response.data.data);

  } catch (error) {
    console.error('Get transactions error:', error.response?.data || error.message);
    sendResponse(res, 500, false, 'Failed to fetch transactions', error.response?.data?.message || error.message);
  }
});

// ============================================
// GET SINGLE TRANSACTION
// ============================================
router.get('/transactions/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const response = await flwAPI.get(`/transactions/${id}`);

    sendResponse(res, 200, true, 'Transaction retrieved', response.data.data);

  } catch (error) {
    console.error('Get transaction error:', error.response?.data || error.message);
    sendResponse(res, 500, false, 'Failed to fetch transaction', error.response?.data?.message || error.message);
  }
});

// ============================================
// REFUND PAYMENT
// ============================================
router.post('/refund', authMiddleware, async (req, res) => {
  try {
    const { transactionId, amount } = req.body;

    if (!transactionId) {
      return sendResponse(res, 400, false, 'Transaction ID is required');
    }

    const payload = { id: transactionId };
    if (amount) payload.amount = amount;

    const response = await flwAPI.post(`/transactions/${transactionId}/refund`, payload);

    sendResponse(res, 200, true, 'Refund initiated', response.data.data);

  } catch (error) {
    console.error('Refund error:', error.response?.data || error.message);
    sendResponse(res, 500, false, 'Refund failed', error.response?.data?.message || error.message);
  }
});

module.exports = router;