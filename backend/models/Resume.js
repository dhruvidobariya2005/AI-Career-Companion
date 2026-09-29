const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ["pdf", "docx"],
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    parsedData: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      phone: { type: String, default: "" },
      skills: { type: [String], default: [] },
      experience: [
        {
          company: { type: String, default: "" },
          role: { type: String, default: "" },
          duration: { type: String, default: "" },
          description: { type: String, default: "" },
        },
      ],
      education: [
        {
          institution: { type: String, default: "" },
          degree: { type: String, default: "" },
          year: { type: String, default: "" },
        },
      ],
    },
    atsAnalysis: {
      jobDescription: { type: String, default: "" },
      score: { type: Number, default: 0 },
      matchingKeywords: { type: [String], default: [] },
      missingKeywords: { type: [String], default: [] },
      recommendations: { type: [String], default: [] },
    },
    skillGapAnalysis: {
      jobDescription: { type: String, default: "" },
      matchingSkills: { type: [String], default: [] },
      missingSkills: { type: [String], default: [] },
      recommendations: [
        {
          skill: { type: String, default: "" },
          courses: { type: [String], default: [] },
          projects: { type: [String], default: [] },
        },
      ],
    },
    improvementSuggestions: [
      {
        section: { type: String, default: "" },
        originalText: { type: String, default: "" },
        suggestedText: { type: String, default: "" },
        reason: { type: String, default: "" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);
