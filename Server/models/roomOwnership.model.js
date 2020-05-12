const mongoose = require('mongoose');
const conn = mongoose.createConnection("mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority");

var roomOwnershipSchema = mongoose.Schema({
  owner_userName: String,
  party_room_id: Number
}, {
  timestamps: true
});

const roomOwnership = conn.model('roomOwnership', roomOwnershipSchema);
module.exports = roomOwnership;