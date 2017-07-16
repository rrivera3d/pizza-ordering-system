var PriceCalculator = function(options)
{
  options = (options) ? options : {};

  this.quantity = (options.quantity) ? options.quantity : 1;
  this.tax = (options.tax) ? options.tax : 0;
  this.subTotal = 0;
};

PriceCalculator.prototype.getSubTotal = function(itemPrices)
{
  itemPrices = (itemPrices) ? itemPrices : [];

  var subTotal = 0;

  if(itemPrices.length > 0)
  {
    itemPrices.forEach(function(price){
      subTotal += price;
    });

    return (Math.round(100*subTotal)/100) * this.quantity;
  }
  else
  {
    console.log("There are no items to compute!");
  }
};

PriceCalculator.prototype.getTax = function(itemPrices)
{
  var totalTax = this.tax * this.getSubTotal(itemPrices);
  return Math.round(100*totalTax)/100;
};

PriceCalculator.prototype.getTaxPercent = function()
{
  return Math.round(100*this.tax);
};

PriceCalculator.prototype.getTotal = function(itemPrices)
{
  var total = this.getSubTotal(itemPrices) * (1 + this.tax);
  return  Math.round(100*total)/100;
};

module.exports = PriceCalculator;
