const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    fullname:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        required: true
    },
    subject:{
        type: String,
        required: true
    },
    message:{
        type: String,
        required: true
    },
    isRead:{
        type: Boolean,
        required: true
    },
    timeSent:{
        type: String,
        required: true
    }
})

const Message = mongoose.model('message', MessageSchema);
module.exports = Message; 