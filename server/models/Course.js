import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    organization: {
      type: String,
      trim: true,
      index: true,
    },
    // Parsed from the comma-separated "Skills" column into a clean array,
    // lowercased copy kept for matching, original casing kept for display.
    skills: [
      {
        type: String,
        trim: true,
      },
    ],
    skillsLower: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: null,
    },
    reviewCount: {
      type: Number, // parsed from strings like "20K" -> 20000
      default: 0,
    },
    studentsEnrolled: {
      type: Number, // parsed from "700,909" -> 700909
      default: 0,
    },
    courseUrl: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Mixed"],
      default: "Mixed",
      index: true,
    },
    type: {
      type: String,
      enum: ["Course", "Specialization", "Professional Certificate", "Guided Project", "Project"],
      default: "Course",
    },
    duration: {
      type: String, // kept as free text, e.g. "3 - 6 Months" — dataset doesn't give clean numeric duration
      trim: true,
    },
  },
  { timestamps: true }
);

// Text index for fallback free-text search across title/description/org
courseSchema.index({ title: "text", description: "text", organization: "text" });

const Course = mongoose.model("Course", courseSchema);

export default Course;
