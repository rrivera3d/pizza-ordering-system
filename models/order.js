var mongoose = require('mongoose'),
   Schema = mongoose.Schema;

var CustomerSchema = new Schema({
  name : String,
  address : String,
  phone : String
});

var PizzaSchema = new Schema({
  size: Number,
  toppings: Array,
  type: String
});

var OrderSchema = new Schema({
  customer: { type : Object, default : CustomerSchema },
  created : { type : Date, default : Date.now },
  pizza: { type : Object, default : PizzaSchema },
  processed: { type: Boolean, default : false },
  quantity: Number,
  subtotal: Number,
  tax: Number,
  total: Number
});

module.exports = mongoose.model('Order', OrderSchema);
