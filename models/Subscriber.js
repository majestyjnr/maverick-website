const mongoose = require('mongoose');

const SubscriberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    timeSubscribed: {
        type: String,
        required: true
    }
});

const Subscriber = mongoose.model('subscriber', SubscriberSchema);

module.exports = Subscriber;