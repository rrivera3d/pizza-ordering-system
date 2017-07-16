var PriceCalculator = require("./price-calculator");
var accounting = require("accounting");
var _ = require("underscore");
var moment = require("moment");

//Retrieve cutomer info
var getCustomerInfo = function(req, pizzaData)
{
  return {
    name: req.customer.name,
    phone: req.customer.phone,
    address: req.customer.address
  }
};

//Calculate delivery time
var getDeliveryTime = function(req, pizzaData)
{
  var quantity = req.quantity;
  var toppings = req.pizza.toppings;
  var timeFactor = pizzaData.extraTimeFactor;

  var toppingsTime = 0;
  if(!!toppings && typeof toppings === "string")
  {
    toppingsTime = 1;
  }

  if(!!toppings && Array.isArray(toppings))
  {
    toppingsTime = toppings.length;
  }

  //time to create the first pizza
  var initialPizza = pizzaData.baseTime + toppingsTime;
  var time = initialPizza + (quantity * (initialPizza * timeFactor));
  var approximateTime = Math.round(time);

  return  approximateTime + " minutes";
};

//Return orders
var getOrder = function(req, pizzaData)
{
  var pizzaSizeByName = _.indexBy(pizzaData.sizes, "name");
  var pizzaTypeByName = _.indexBy(pizzaData.types, "name");
  var pizzaToppingsByName = _.indexBy(pizzaData.toppings, "name");

  var size = pizzaSizeByName[req.pizza.size.toString()];
  var type = pizzaTypeByName[req.pizza.type];

  var quantity = req.quantity;
  var toppings = req.pizza.toppings;

  //Format Toppings to labels
  var getToppingLabels = function()
  {
    var toppingLabels = [];

    //Push each topping prices to itemPrices
    var pushToppingLabel = function(name)
    {
      var topping = pizzaToppingsByName[name];
      toppingLabels.push(topping.label);
    };

    if(!!toppings && typeof toppings === "string")
    {
      pushToppingLabel(toppings);
    }

    if(!!toppings && Array.isArray(toppings))
    {
      toppings.forEach(pushToppingLabel);
    }

    return toppingLabels.join(", ")
  };

  return {
    quantity: quantity,
    size: size.label,
    type: type.label,
    toppings: getToppingLabels()
  };
};

//Return Price Object
var getPrice = function(req, pizzaData)
{
  var pizzaSizeByName = _.indexBy(pizzaData.sizes, "name");
  var pizzaTypeByName = _.indexBy(pizzaData.types, "name");
  var pizzaToppingsByName = _.indexBy(pizzaData.toppings, "name");

  var size = pizzaSizeByName[req.pizza.size.toString()];
  var type = pizzaTypeByName[req.pizza.type];

  var toppings = req.pizza.toppings;
  var quantity = req.quantity;

  //Instantiate new price calculator
  var priceCalculator = new PriceCalculator({
    quantity: quantity,
    tax: pizzaData.tax
  });

  var itemPrices = [];

  //Push Base Price
  itemPrices.push(pizzaData.basePrice);

  //Push Pizza Size Price to itemPrices
  itemPrices.push(size.price);

  //Push Pizza Type Price to itemPrices
  itemPrices.push(type.price);

  //Push each topping prices to itemPrices
  var pushTopping = function(name)
  {
    var topping = pizzaToppingsByName[name];
    itemPrices.push(topping.price);
  };

  if(!!toppings && typeof toppings === "string")
  {
    pushTopping(toppings);
  }

  if(!!toppings && Array.isArray(toppings))
  {
    toppings.forEach(pushTopping);
  }

  return {
    subTotal: accounting.formatMoney(priceCalculator.getSubTotal(itemPrices)),
    tax: accounting.formatMoney(priceCalculator.getTax(itemPrices)),
    taxPercent: priceCalculator.getTaxPercent(),
    total: accounting.formatMoney(priceCalculator.getTotal(itemPrices))
  }
};

exports.addPriceLabelsTo = function(pizzaData)
{
  var pricingData = pizzaData;

  for(var key in pricingData)
  {
    if(Array.isArray(pricingData[key]))
    {
      pricingData[key].forEach(function(priceTable, i)
      {
        if(priceTable.hasOwnProperty("price"))
        {
          var price = (!!priceTable.includeBasePrice) ? priceTable.price + pizzaData.basePrice : priceTable.price;
          pricingData[key][i].accPrice = accounting.formatMoney(price);
        }
      });
    }
  }

  return pricingData;
};

exports.process = function(req, pizzaData)
{
  var customer = getCustomerInfo(req) || {};
  var deliveryTime = getDeliveryTime(req, pizzaData) || "Unknown";
  var order = getOrder(req, pizzaData) || {};
  var price = getPrice(req, pizzaData) || {};

  return {
    id: req._id,
    customer: customer,
    deliveryTime: deliveryTime,
    order: order,
    price: price,
    processed: req.processed,
    status: (req.processed) ? "Processed" : "Pending",
    created: moment(req.created).format('MMMM DD, YYYY \n hh:mm a')
  };
};
