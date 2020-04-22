const mongoose = require('mongoose');
const conn = mongoose.createConnection("mongodb+srv://jacky:jacky310@cluster0-5jjxe.gcp.mongodb.net/PartyRoomBooking?retryWrites=true&w=majority");

var roomOwnershipSchema = mongoose.Schema({
  party_room_objId: { type: mongoose.Schema.Types.ObjectId, ref: "partyrooms", required: true},
  owner_objId: { type: mongoose.Schema.Types.ObjectId, ref: "owners", required: true},
},{
    timestamps: true,
});

const roomOwnership = conn.model('roomOwnership', roomOwnershipSchema);
module.exports = roomOwnership;
