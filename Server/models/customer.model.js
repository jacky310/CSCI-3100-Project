const mongoose = require('mongoose');
const conn = mongoose.createConnection("mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority");
const Schema = mongoose.Schema;

const customer_schema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  phone: { type: String, required: true }
}, {
  timestamps: true
});

const customer = conn.model('customer', customer_schema);
module.exports = customer;
