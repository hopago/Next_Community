import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGO_URI) return console.log("MONGODB_URL not found...");

    if (isConnected) return console.log("MongoDB Already connected...");

    try {
        await mongoose.connect(process.env.MONGO_URI);

        isConnected = true;

        console.log("Connected to MongoDB...");
    } catch (err) {
        console.log(err);
    }
};