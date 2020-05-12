const mongoose = require('mongoose');
const conn = mongoose.createConnection("mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority");

var bookingRecordSchema = mongoose.Schema({
  party_room_id: { type: Number, required: true },
  owner_userName: { type: String, required: true },
  customer_userName: { type: String, required: true },
  time: [{
    bookingStart: { type: Date, required: true },
    bookingEnd: { type: Date, required: true }
  }],
  numPeople: { type: Number, required: true }
}, {
  timestamps: true
});

const bookingRecord = conn.model('bookingRecord', bookingRecordSchema);
module.exports = bookingRecord;
