import express from "express";
import {
  createQuizQuestions,
  createQuizTitle,
  getAllQuizTitle,
  getQuizQuestions,
  submitAnswerAndGetScore,
} from "../controllers/quizControllers.js";

const router = express.Router();

router.post("/", createQuizTitle);

router.post("/:quizId/questions", createQuizQuestions);

router.get("/", getAllQuizTitle);

router.get("/:quizId/questions", getQuizQuestions);

router.post("/:quizId/submit", submitAnswerAndGetScore);

export default router;
