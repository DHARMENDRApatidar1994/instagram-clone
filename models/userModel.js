const mongoose = require("mongoose")



const userModel = new mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    gender: String,
    number: String,
    // photo: String,
    avatar: {
        type: String,
        default: "default.png",
    },
},
{ timestamps: true

})




const user = mongoose.model("user",userModel);

module.exports = user