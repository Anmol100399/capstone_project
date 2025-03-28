const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'username' },
  title: String,
  description: String,
  organizedBy: String,
  eventDate: Date,
  eventTime: String,
  location: String,
  Participants: Number,
  Count: Number,
  Income: Number,
  ticketPrice: Number,
  Quantity: Number,
  image: String,
  likes: Number,
  Comment: [String],
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  rejectionReason: String,
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;