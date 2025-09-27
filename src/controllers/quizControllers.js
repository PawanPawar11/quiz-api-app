import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";

export const createQuizTitle = async (req, res) => {
  try {
    const newQuiz = new Quiz(req.body);
    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const createQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { text, options, correctOptionId } = req.body;

    const quizExists = Quiz.findById(quizId);

    if (!quizExists) {
      return res.status(404).send({ error: "Quiz not found" });
    }

    const newQuestion = new Question({
      quizId,
      text,
      options,
      correctOptionId,
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
