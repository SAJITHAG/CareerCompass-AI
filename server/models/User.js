import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // never returned by default queries
    },

    // --- Student profile (Step 2 of the user flow) ---
    profile: {
      education: { type: String, trim: true, default: "" },
      experienceLevel: {
        type: String,
        enum: ["Student", "Fresher", "0-1 years", "1-3 years", "3+ years"],
        default: "Student",
      },
      technicalSkills: [{ type: String, trim: true }],
      softSkills: [{ type: String, trim: true }],
      interests: [{ type: String, trim: true }],
      favoriteSubjects: [{ type: String, trim: true }],
      preferredWorkType: {
        type: String,
        enum: ["Remote", "Hybrid", "On-site", "No preference"],
        default: "No preference",
      },
      careerGoal: { type: String, trim: true, default: "" },

      // When each skill was added/marked complete — powers the roadmap's
      // "mark complete" feature and skill-freshness revisit nudges. Keyed
      // by the exact skill string (as stored in technicalSkills/softSkills).
      skillTimestamps: { type: Map, of: Date, default: {} },
    },

    // --- Latest AI career analysis snapshot, for the dashboard ---
    latestAnalysis: {
      topCareer: { type: String, default: null },
      matchPercentage: { type: Number, default: null },
      analyzedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
