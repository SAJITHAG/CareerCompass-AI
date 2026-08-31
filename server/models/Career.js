import mongoose from "mongoose";

const careerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    optionalSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    relatedInterests: [
      {
        type: String,
        trim: true,
      },
    ],
    difficultyLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Intermediate",
    },
    // Ordered list of skill topics that make up the default learning roadmap
    // for this career — used to build Step 6's phase-by-phase roadmap.
    recommendedLearningSequence: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);

const Career = mongoose.model("Career", careerSchema);

export default Career;
