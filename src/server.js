import dotenv from "dotenv";
import express from "express";
import { connectToDB } from "./config/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Database connection
connectToDB();

app.get("/", (req, res) => {
  return res.send({ message: "Default route is working fine! 👍🏻" });
});

app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
