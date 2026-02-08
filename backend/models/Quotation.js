// backend/models/Quotation.js
const mongoose = require('mongoose');

const QuotationItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    unit: { type: String, default: 'ชิ้น' },
    cost: { type: Number, required: true },
    quantity: { type: Number, required: true },
    margin: { type: Number, default: 0 }, // เพิ่ม margin ใน item
    total: { type: Number, required: true },
  },
  { _id: false }
);

const QuotationSchema = new mongoose.Schema(
  {
    quotation_number: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customer_name: {
      type: String,
      required: true,
      index: true,
    },
    recipient: { type: String }, // เพิ่ม
    customer_address: { type: String }, // เพิ่ม
    customer_phone: { type: String }, // เพิ่ม
    prepared_by: { type: String }, // เพิ่ม
    prepared_phone: { type: String }, // เพิ่ม
    issue_date: {
      type: Date,
      default: Date.now,
    },
    validity_days: { type: Number, default: 30 }, // เพิ่ม
    expiry_date: { type: Date }, // เพิ่ม
    items: {
      type: [QuotationItemSchema],
      required: true,
    },
    sub_total: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    vat: {
      type: Number,
      default: 0,
    },
    grand_total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
      default: 'draft',
      index: true,
    },
    note: {
      type: String,
    },
    created_by: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: {
      createdAt: 'created_date',
      updatedAt: 'updated_date',
    },
  }
);

QuotationSchema.index({
  quotation_number: 1,
  customer_name: 1,
  created_date: -1,
});

module.exports = mongoose.model('Quotation', QuotationSchema);