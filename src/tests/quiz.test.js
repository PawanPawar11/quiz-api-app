import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";
import Quiz from "../models/Quiz.js";
import Question from "../models/Question.js";
import quizRoutes from "../routes/quizRoutes.js";
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";

const app = express();
app.use(express.json());
app.use("/api/quizzes", quizRoutes);

describe("Quiz API Tests", () => {
  let mongoServer;

  beforeAll(async () => {
    // Setup in-memory MongoDB for testing
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Cleanup
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear database before each test
    await Quiz.deleteMany({});
    await Question.deleteMany({});
  });

  describe("POST /api/quizzes - Create Quiz", () => {
    it("should create a new quiz successfully", async () => {
      const quizData = {
        title: "JavaScript Fundamentals",
      };

      const response = await request(app)
        .post("/api/quizzes")
        .send(quizData)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.title).toBe(quizData.title);

      // Verify in database
      const savedQuiz = await Quiz.findById(response.body._id);
      expect(savedQuiz.title).toBe(quizData.title);
    });

    it("should return 400 for missing title", async () => {
      const response = await request(app)
        .post("/api/quizzes")
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should trim whitespace from title", async () => {
      const quizData = {
        title: "  JavaScript Basics  ",
      };

      const response = await request(app)
        .post("/api/quizzes")
        .send(quizData)
        .expect(201);

      expect(response.body.title).toBe("JavaScript Basics");
    });
  });

  describe("POST /api/quizzes/:quizId/questions - Add Question", () => {
    let quizId;

    beforeEach(async () => {
      const quiz = new Quiz({ title: "Test Quiz" });
      const savedQuiz = await quiz.save();
      quizId = savedQuiz._id.toString();
    });

    it("should add a question to existing quiz", async () => {
      const questionData = {
        text: "What is the capital of France?",
        options: [
          { id: "opt1", text: "Berlin" },
          { id: "opt2", text: "Madrid" },
          { id: "opt3", text: "Paris" },
          { id: "opt4", text: "Rome" },
        ],
        correctOptionId: "opt3",
      };

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .send(questionData)
        .expect(201);

      expect(response.body).toHaveProperty("_id");
      expect(response.body.text).toBe(questionData.text);
      expect(response.body.quizId).toBe(quizId);
      expect(response.body.options).toHaveLength(4);
      expect(response.body.correctOptionId).toBe("opt3");
    });

    it("should return 400 for missing required fields", async () => {
      const incompleteQuestion = {
        text: "Incomplete question",
        // Missing options and correctOptionId
      };

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .send(incompleteQuestion)
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return 404 for non-existent quiz", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const questionData = {
        text: "Test question",
        options: [
          { id: "opt1", text: "Option 1" },
          { id: "opt2", text: "Option 2" },
        ],
        correctOptionId: "opt1",
      };

      const response = await request(app)
        .post(`/api/quizzes/${nonExistentId}/questions`)
        .send(questionData)
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("GET /api/quizzes - Get All Quizzes", () => {
    it("should return empty array when no quizzes exist", async () => {
      const response = await request(app).get("/api/quizzes").expect(200);

      expect(response.body).toEqual([]);
    });

    it("should return all quiz titles", async () => {
      // Create test quizzes
      await Quiz.create([
        { title: "JavaScript Quiz" },
        { title: "Python Quiz" },
        { title: "React Quiz" },
      ]);

      const response = await request(app).get("/api/quizzes").expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty("title");
      expect(response.body[0]).toHaveProperty("_id");

      const titles = response.body.map((quiz) => quiz.title);
      expect(titles).toContain("JavaScript Quiz");
      expect(titles).toContain("Python Quiz");
      expect(titles).toContain("React Quiz");
    });
  });

  describe("GET /api/quizzes/:quizId/questions - Get Quiz Questions", () => {
    let quizId;

    beforeEach(async () => {
      const quiz = new Quiz({ title: "Test Quiz" });
      const savedQuiz = await quiz.save();
      quizId = savedQuiz._id.toString();

      // Add test questions
      await Question.create([
        {
          quizId,
          text: "Question 1?",
          options: [
            { id: "q1opt1", text: "Answer 1" },
            { id: "q1opt2", text: "Answer 2" },
          ],
          correctOptionId: "q1opt1",
        },
        {
          quizId,
          text: "Question 2?",
          options: [
            { id: "q2opt1", text: "Answer A" },
            { id: "q2opt2", text: "Answer B" },
          ],
          correctOptionId: "q2opt2",
        },
      ]);
    });

    it("should return questions without correct answers", async () => {
      const response = await request(app)
        .get(`/api/quizzes/${quizId}/questions`)
        .expect(200);

      expect(response.body).toHaveLength(2);

      // Verify correct answers are not exposed
      response.body.forEach((question) => {
        expect(question).not.toHaveProperty("correctOptionId");
        expect(question).toHaveProperty("text");
        expect(question).toHaveProperty("options");
        expect(question.options).toHaveLength(2);
      });
    });

    it("should return empty array for quiz with no questions", async () => {
      const emptyQuiz = new Quiz({ title: "Empty Quiz" });
      const savedEmptyQuiz = await emptyQuiz.save();

      const response = await request(app)
        .get(`/api/quizzes/${savedEmptyQuiz._id}/questions`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe("POST /api/quizzes/:quizId/submit - Submit Answers", () => {
    let quizId;
    let question1Id, question2Id, question3Id;

    beforeEach(async () => {
      // Create quiz
      const quiz = new Quiz({ title: "Test Quiz" });
      const savedQuiz = await quiz.save();
      quizId = savedQuiz._id.toString();

      // Create questions
      const questions = await Question.create([
        {
          quizId,
          text: "What is 2+2?",
          options: [
            { id: "opt1", text: "3" },
            { id: "opt2", text: "4" },
            { id: "opt3", text: "5" },
          ],
          correctOptionId: "opt2",
        },
        {
          quizId,
          text: "What is the capital of Japan?",
          options: [
            { id: "opt1", text: "Tokyo" },
            { id: "opt2", text: "Osaka" },
            { id: "opt3", text: "Kyoto" },
          ],
          correctOptionId: "opt1",
        },
        {
          quizId,
          text: "What color is the sky?",
          options: [
            { id: "opt1", text: "Green" },
            { id: "opt2", text: "Blue" },
            { id: "opt3", text: "Red" },
          ],
          correctOptionId: "opt2",
        },
      ]);

      question1Id = questions[0]._id.toString();
      question2Id = questions[1]._id.toString();
      question3Id = questions[2]._id.toString();
    });

    it("should calculate correct score for perfect answers", async () => {
      const answers = {
        answers: [
          { questionId: question1Id, selectedOptionId: "opt2" }, // Correct
          { questionId: question2Id, selectedOptionId: "opt1" }, // Correct
          { questionId: question3Id, selectedOptionId: "opt2" }, // Correct
        ],
      };

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/submit`)
        .send(answers)
        .expect(200);

      expect(response.body).toEqual({
        score: 3,
        total: 3,
      });
    });

    it("should calculate partial score for mixed answers", async () => {
      const answers = {
        answers: [
          { questionId: question1Id, selectedOptionId: "opt2" }, // Correct
          { questionId: question2Id, selectedOptionId: "opt2" }, // Wrong
          { questionId: question3Id, selectedOptionId: "opt2" }, // Correct
        ],
      };

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/submit`)
        .send(answers)
        .expect(200);

      expect(response.body).toEqual({
        score: 2,
        total: 3,
      });
    });

    it("should return zero score for all wrong answers", async () => {
      const answers = {
        answers: [
          { questionId: question1Id, selectedOptionId: "opt1" }, // Wrong
          { questionId: question2Id, selectedOptionId: "opt2" }, // Wrong
          { questionId: question3Id, selectedOptionId: "opt3" }, // Wrong
        ],
      };

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/submit`)
        .send(answers)
        .expect(200);

      expect(response.body).toEqual({
        score: 0,
        total: 3,
      });
    });

    it("should handle partial submissions", async () => {
      const answers = {
        answers: [
          { questionId: question1Id, selectedOptionId: "opt2" }, // Correct
          { questionId: question2Id, selectedOptionId: "opt1" }, // Correct (only 2 out of 3 questions)
        ],
      };

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/submit`)
        .send(answers)
        .expect(200);

      expect(response.body).toEqual({
        score: 2,
        total: 3, // Total should still be 3 (total questions in quiz)
      });
    });

    it("should return 400 for invalid answer format", async () => {
      const invalidAnswers = {
        answers: "not an array",
      };

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/submit`)
        .send(invalidAnswers)
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toBe("Answers must be in array format");
    });

    it("should return 400 for quiz with no questions", async () => {
      const emptyQuiz = new Quiz({ title: "Empty Quiz" });
      const savedEmptyQuiz = await emptyQuiz.save();

      const answers = {
        answers: [],
      };

      const response = await request(app)
        .post(`/api/quizzes/${savedEmptyQuiz._id}/submit`)
        .send(answers)
        .expect(400);

      expect(response.body.error).toBe("No questions are found for this quiz");
    });

    it("should handle non-existent question IDs gracefully", async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const answers = {
        answers: [
          { questionId: question1Id, selectedOptionId: "opt2" }, // Valid
          { questionId: nonExistentId.toString(), selectedOptionId: "opt1" }, // Invalid
        ],
      };

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/submit`)
        .send(answers)
        .expect(200);

      expect(response.body).toEqual({
        score: 1, // Only the valid question counts
        total: 3,
      });
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid MongoDB ObjectIds", async () => {
      const invalidId = "invalid-id";

      const response = await request(app)
        .get(`/api/quizzes/${invalidId}/questions`)
        .expect(500);

      expect(response.body).toHaveProperty("error");
    });

    it("should handle database connection errors gracefully", async () => {
      // This test would require mocking MongoDB connection failures
      // For now, we'll test that errors are properly formatted
      const response = await request(app)
        .post("/api/quizzes")
        .send({ title: "" }) // This should trigger a validation error
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });
  });
});
