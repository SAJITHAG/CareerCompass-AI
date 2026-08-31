// Run with: npm run seed
// Imports server/data/coursera.csv into the Course collection and loads the
// static career knowledge base into the Career collection. Safe to re-run —
// it clears both collections first, so it's idempotent.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import csv from "csv-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";

import connectDB from "../config/db.js";
import Course from "../models/Course.js";
import Career from "../models/Career.js";
import careersData from "../data/careers.js";
import {
  parseSkills,
  parseReviewCount,
  parseStudentsEnrolled,
  parseRating,
  parseDifficulty,
  parseType,
} from "./csvParsers.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, "..", "data", "coursera.csv");

const seedCourses = async () => {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(
      `Dataset not found at ${CSV_PATH}. Place the Coursera CSV at server/data/coursera.csv before seeding.`
    );
  }

  const rows = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(CSV_PATH)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  console.log(`Parsed ${rows.length} rows from CSV`);

  const courses = rows
    .filter((row) => row.Title && row.Title.trim()) // skip malformed/empty rows
    .map((row) => {
      const skills = parseSkills(row.Skills);
      return {
        title: row.Title.trim(),
        organization: (row.Organization || "").trim(),
        skills,
        skillsLower: skills.map((s) => s.toLowerCase()),
        rating: parseRating(row.Ratings),
        reviewCount: parseReviewCount(row["Review Count"]),
        studentsEnrolled: parseStudentsEnrolled(row.course_students_enrolled),
        courseUrl: (row.course_url || "").trim(),
        description: (row.course_description || "").trim(),
        difficulty: parseDifficulty(row.Difficulty),
        type: parseType(row.Type),
        duration: (row.Duration || "").trim(),
      };
    });

  await Course.deleteMany({});
  const inserted = await Course.insertMany(courses, { ordered: false });
  console.log(`Inserted ${inserted.length} courses`);
};

const seedCareers = async () => {
  await Career.deleteMany({});
  const inserted = await Career.insertMany(careersData);
  console.log(`Inserted ${inserted.length} careers`);
};

const run = async () => {
  try {
    await connectDB();
    await seedCourses();
    await seedCareers();
    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

run();
