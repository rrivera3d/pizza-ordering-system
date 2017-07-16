var express = require('express');
var router = express.Router();

var Order = require('../models/order');

//Imports orderProcessor which uses priceCalculator to calculate price
var orderProcessor = require("../lib/order-processor");

//Data
var pizzaData = require("../data/pizza.json");

/* GET home page. */
router.get('/', function(req, res, next)
{
  var pricingData = orderProcessor.addPriceLabelsTo(pizzaData);
  pricingData.title = "Order Form";
  res.render("index", pricingData);
});

router.post('/', function(req, res, next)
{
  var pricingData = orderProcessor.addPriceLabelsTo(pizzaData);
  pricingData.error = null;

  res.locals.isPostback = true;

  var order = new Order({
    customer: {
      name : req.body.name,
      address : req.body.address,
      phone : req.body.phone
    },
    pizza: {
      size: req.body.size,
      toppings: req.body.toppings,
      type: req.body.type
    },
    quantity: req.body.quantity
  });

  order.save(function(err) {
    if (err) {
      pricingData.error = 'Save failed : ' + err;
    }
    res.render('index', pricingData);
  });
});

module.exports = router;
