import { Schema } from 'mongoose';
import { OrderState } from '../../domain/order-state.js';

// Mongoose persistence shape — maps to Order aggregate
export const OrderSchema = new Schema(
  {
    _id: { type: String, required: true, alias: 'id' },
    state: {
      type: String,
      enum: Object.values(OrderState),
      required: true,
    },
    customer: {
      id: { type: String, required: true },
      name: { type: String, required: true },
      email: { type: String },
    },
    lineItems: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    assignedEmployee: {
      id: { type: String },
      name: { type: String },
    },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  {
    _id: false,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

OrderSchema.virtual('id').get(function () {
  return this._id;
});
