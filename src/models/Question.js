import { Schema, model } from "mongoose";

const QuestionSchema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    options: [
      {
        id: { type: String, required: true },
        text: { type: String, required: true },
      },
    ],

    correctOptionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Question = model("Question", QuestionSchema);

export default Question;
