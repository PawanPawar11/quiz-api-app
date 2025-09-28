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

    const quizExists = await Quiz.findById(quizId);

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

export const getAllQuizTitle = async (req, res) => {
  try {
    const quizzes = await Quiz.find().select("title");
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};

export const getQuizQuestions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const questions = await Question.find({ quizId }).select(
      "-correctOptionId"
    );

    res.json(questions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const submitAnswerAndGetScore = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "Answers must be in array format" });
    }

    const totalQuestions = await Question.countDocuments({ quizId });

    if (totalQuestions === 0) {
      return res
        .status(400)
        .json({ error: "No questions are found for this quiz" });
    }

    const questionIds = answers.map((a) => a.questionId);

    const correctAnswers = await Question.find({
      _id: questionIds,
      quizId: quizId,
    }).select("correctOptionId");

    let score = 0;

    for (const userAnswer of answers) {
      const { questionId, selectedOptionId } = userAnswer;

      const correctAnswerDoc = correctAnswers.find(
        (q) => q._id.toString() === questionId
      );

      if (
        correctAnswerDoc &&
        correctAnswerDoc.correctOptionId === selectedOptionId
      ) {
        score++;
      }
    }

    res.json({ score, total: totalQuestions });
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};
