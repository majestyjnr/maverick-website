const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
    adminName:{
        type: String,
        required: true
    }, 
    adminTelephone:{
        type: String,
        required: true
    },
    adminEmail:{
        type: String,
        required: true
    },
    adminImage:{
        type: String,
        required: true
    },
    adminBio:{
        type: String,
        required: true
    },
    adminPassword:{
        type: String,
        required: true
    },
    timeRegistered:{
        type: String,
        required: true
    },
})

const Admin = mongoose.model('admin', AdminSchema);
module.exports = Admin;