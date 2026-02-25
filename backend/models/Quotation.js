// backend/models/Quotation.js
const mongoose = require('mongoose');

const QuotationItemSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    category: { type: String },
    unit:     { type: String, default: 'ชิ้น' },
    cost:     { type: Number, required: true },
    quantity: { type: Number, required: true },
    margin:   { type: Number, default: 0 },
    total:    { type: Number, required: true },
  },
  { _id: false }
);

const QuotationSchema = new mongoose.Schema(
  {
    quotation_number:  { type: String, required: true, unique: true, index: true },
    customer_name:     { type: String, required: true, index: true },
    recipient:         { type: String },
    customer_address:  { type: String },
    prepared_by:       { type: String },
    prepared_phone:    { type: String },
    coordinator_name:  { type: String },
    coordinator_phone: { type: String },
    issue_date:        { type: Date,   default: null },
    validity_days:     { type: Number, default: null },
    expiry_date:       { type: Date,   default: null },
    items:             { type: [QuotationItemSchema], default: [] },
    sub_total:         { type: Number, required: true },
    discount:          { type: Number, default: 0 },
    vat_percent:       { type: Number, default: 7 },
    vat:               { type: Number, default: 0 },
    grand_total:       { type: Number, required: true },
    status: {
      type: String,
      enum: ['ร่าง', 'ส่งแล้ว', 'อนุมัติ', 'ปฏิเสธ', 'หมดอายุ'],
      default: 'ร่าง',
      index: true,
    },
    note:       { type: String },
    created_by: { type: String, default: 'admin' },
  },
  {
    timestamps: {
      createdAt: 'created_date',
      updatedAt: 'updated_date',
    },
  }
);

QuotationSchema.index({ quotation_number: 1, customer_name: 1, created_date: -1 });

module.exports = mongoose.model('Quotation', QuotationSchema);