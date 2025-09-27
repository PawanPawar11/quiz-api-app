import express from "express";
import {
  createQuizQuestions,
  createQuizTitle,
} from "../controllers/quizControllers.js";

const router = express.Router();

router.post("/", createQuizTitle);

router.post("/:quizId/questions", createQuizQuestions);

export default router;
