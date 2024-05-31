require("dotenv").config();
const { MongoClient } = require("mongodb");

const uri = "mongodb+srv://admin:7635074651@cluster0.8rccap1.mongodb.net/";

let client;
const connectToMongoDB = async () => {
    if (!client) {
        try {
            client = await MongoClient.connect(uri);
            console.log("Connected to MongoDB");
        } catch (error) {
            console.log(error);
        }
    }
    return client;
};

const getConnectedClient = () => client;

module.exports = { connectToMongoDB, getConnectedClient };