const mongoose = require('mongoose');
const conn = mongoose.createConnection("mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority");

var PartyRoomSchema = mongoose.Schema({
  party_room_id: { type: Number, required: true, unique: true },
  party_room_name: { type: String, required: true, unique: true },
  party_room_number: { type: String, required: true },
  address: { type: String, required: true },
  district: { type: String, required: true },
  description: { type: String },
  quotaMin: { type: Number, required: true },
  quotaMax: { type: Number, required: true },
  price_setting: [{
    day: { type: String, required: true },
    startTime: { type: Number, required: true },
    endTime: { type: Number, required: true },
    price: { type: Number, required: true },
  }],
  facilities: [String],
  photos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'photos.files'
  }]
}, {
  timestamps: true
});

const PartyRoom = conn.model('PartyRoom', PartyRoomSchema);
module.exports = PartyRoom;
