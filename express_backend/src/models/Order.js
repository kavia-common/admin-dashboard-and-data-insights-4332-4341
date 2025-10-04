'use strict';

const mongoose = require('mongoose');

const { Schema } = mongoose;

const ORDER_STATUS = ['pending', 'processing', 'completed', 'cancelled'];

const OrderSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    status: { type: String, enum: ORDER_STATUS, default: 'pending', index: true },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    placedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// PUBLIC_INTERFACE
OrderSchema.statics.calculateTotal = function calculateTotal(items) {
  /** Calculate total amount from items. */
  return items.reduce((sum, item) => sum + item.qty * item.price, 0);
};

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
