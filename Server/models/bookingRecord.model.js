const mongoose = require('mongoose');
const conn = mongoose.createConnection("mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority");

var bookingRecordSchema = mongoose.Schema({
  party_room_objId: { type: mongoose.Schema.Types.ObjectId, ref: "partyrooms", required: true},
  owner_objId: { type: mongoose.Schema.Types.ObjectId, ref: "owners", required: true},
  customer_objId: { type: mongoose.Schema.Types.ObjectId, ref: "customers", required: true},
  bookingStart: { type: Date , required: true},
  bookingEnd: { type: Date , required: true},
  numPeople: { type: Number, required: true},
  price: { type: Number, required: true}
},{
    timestamps: true,
});

const bookingRecord = conn.model('bookingRecord', bookingRecordSchema);
module.exports = bookingRecord;
