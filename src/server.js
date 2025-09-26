import dotenv from "dotenv";
import express from "express";
import { connectToDB } from "./config/db.js";
import quizRoutes from "./routes/quizRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Database connection
connectToDB();

// Middleware
app.use(express.json());

app.use("/api/quizzes", quizRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on PORT:${PORT}`);
});
