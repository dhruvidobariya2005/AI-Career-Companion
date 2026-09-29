const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    jobDescription: {
      type: String,
      default: "",
    },
    questions: [
      {
        question: { type: String, required: true },
        category: { type: String, default: "Technical" },
        sampleAnswer: { type: String, default: "" },
      },
    ],
    responses: [
      {
        question: { type: String, required: true },
        userAnswer: { type: String, required: true },
        feedback: { type: String, default: "" },
        rating: { type: Number, default: 0 },
      },
    ],
    overallFeedback: {
      type: String,
      default: "",
    },
    overallScore: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);
