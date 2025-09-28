import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

describe("Model Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Quiz.deleteMany({});
    await Question.deleteMany({});
  });

  describe("Quiz Model", () => {
    it("should create a valid quiz", async () => {
      const quizData = {
        title: "JavaScript Fundamentals",
      };

      const quiz = new Quiz(quizData);
      const savedQuiz = await quiz.save();

      expect(savedQuiz._id).toBeDefined();
      expect(savedQuiz.title).toBe("JavaScript Fundamentals");
    });

    it("should require title field", async () => {
      const quiz = new Quiz({});

      let error;
      try {
        await quiz.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
      expect(error.errors.title).toBeDefined();
    });

    it("should trim whitespace from title", async () => {
      const quiz = new Quiz({
        title: "  Spaced Title  ",
      });

      const savedQuiz = await quiz.save();
      expect(savedQuiz.title).toBe("Spaced Title");
    });
  });

  describe("Question Model", () => {
    let quizId;

    beforeEach(async () => {
      const quiz = new Quiz({ title: "Test Quiz" });
      const savedQuiz = await quiz.save();
      quizId = savedQuiz._id;
    });

    it("should create a valid question", async () => {
      const questionData = {
        quizId,
        text: "What is JavaScript?",
        options: [
          { id: "opt1", text: "A programming language" },
          { id: "opt2", text: "A coffee brand" },
        ],
        correctOptionId: "opt1",
      };

      const question = new Question(questionData);
      const savedQuestion = await question.save();

      expect(savedQuestion._id).toBeDefined();
      expect(savedQuestion.quizId).toEqual(quizId);
      expect(savedQuestion.text).toBe("What is JavaScript?");
      expect(savedQuestion.options).toHaveLength(2);
      expect(savedQuestion.correctOptionId).toBe("opt1");
    });

    it("should validate option structure", async () => {
      const questionWithInvalidOptions = new Question({
        quizId,
        text: "Test question",
        options: [
          { id: "opt1" }, // Missing text
          { text: "Option 2" }, // Missing id
        ],
        correctOptionId: "opt1",
      });

      let error;
      try {
        await questionWithInvalidOptions.save();
      } catch (err) {
        error = err;
      }

      expect(error).toBeDefined();
    });
  });
});
