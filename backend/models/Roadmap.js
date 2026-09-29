const mongoose = require("mongoose");

const roadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetRole: {
      type: String,
      required: true,
    },
    currentSkills: {
      type: [String],
      default: [],
    },
    steps: [
      {
        title: { type: String, required: true },
        description: { type: String, default: "" },
        timeline: { type: String, default: "" },
        skillsToLearn: { type: [String], default: [] },
        resources: { type: [String], default: [] },
        isCompleted: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Roadmap", roadmapSchema);
