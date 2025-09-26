import { connect } from "mongoose";

export const connectToDB = async () => {
  try {
    await connect(process.env.MONGO_URI);
    console.log("MongoDB connected successfully! 🎉");
  } catch (error) {
    console.log("Error occurred while connecting to MongoDB: ", error.message);
    process.exit(1);
  }
};
