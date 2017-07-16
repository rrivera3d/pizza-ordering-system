var express = require('express');
var router = express.Router();

var Order = require('../models/order');

//Imports orderProcessor which uses priceCalculator to calculate price
var orderProcessor = require("../lib/order-processor");

//Data
var pizzaData = require("../data/pizza.json");

/* GET orders listing. */
router.get('/', function(req, res, next)
{
  res.locals.isPostback = false;

  Order.find({}, function(err, orders){
    if (err) {
      return next(err);
    }
    var m_orders = {};
    m_orders.orders = orders.map(function(order){
      return orderProcessor.process(order, pizzaData);
    });
    m_orders.title = 'Orders Processing Center';
    res.render('orders', m_orders);
  });
});

router.get('/:id', function(req, res, next)
{
  var params = req.params;
  var id = params.id;

  Order.findById(id, function(err, order)
  {
    var m_order = orderProcessor.process(order, pizzaData);
    m_order.title = "Order Details";

    if (err) return next(err);
    else {
      res.status(200);
      res.render('order', m_order);
    }
  });
});

router.post('/:id/process', function(req, res, next)
{
  var params = req.params;
  var id = params.id;

  Order.findByIdAndUpdate(id, {processed: true}, function(err, order) {
    if (err) return next(err);
    else {
      res.status(200);
      res.json(order);
    }
  });
});

router.delete('/:id', function(req, res, next)
{
  var params = req.params;
  var id = params.id;

  Order.findByIdAndRemove(id, function(err) {
    if (err) return next(err);
    else {
      res.status(204);
      res.send('success');
    }
  });
});

module.exports = router;
