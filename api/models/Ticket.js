const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
   userid: { type: String },
   eventid: { type: String },
   ticketDetails: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      eventname: { type: String, required: true },
      eventdate: { type: Date, required: true },
      eventtime: { type: String, required: true },
      ticketprice: { type: Number, required: true },
      qr: { type: String, required: true },
   },
   count: { type: Number, default: 0 },
});

const TicketModel = mongoose.model("Ticket", ticketSchema);
module.exports = TicketModel;