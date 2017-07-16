var express = require('express');
var router = express.Router();

// Order Model
var Order = require('../models/order');

//REST API
router.get('/orders', function(req, res, next) {
  Order.find({}, function(err, orders) {
    if (err) {
      return next(err);
    }
    res.json(orders)
  });
});

router.get('/orders/:order_id', function(req, res, next) {
  Order.findById(req.params.order_id, function(err, order) {
    if (err) {
      return next(err);
    }
    res.json(order)
  });
});

module.exports = router;
