const dotenv = require("dotenv");
dotenv.config();
const  mongoose = require('mongoose');
const mongoURI =`${process.env.MONGO_URL}/inotebook?retryWrites=true&w=majority`;
const connectToMongo = ()=>{
    mongoose.connect(mongoURI,()=>{
        console.log("connected to mongo Successfully");

    })
}

module.exports = connectToMongo;