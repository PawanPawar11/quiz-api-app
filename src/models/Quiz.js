import { Schema, model } from "mongoose";

const QuizSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const Quiz = model("Quiz", QuizSchema);

export default Quiz;
