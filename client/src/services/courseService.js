import api from "./api";

export const searchCourses = async ({ skills, query, difficulty, minRating, type, limit } = {}) => {
  const { data } = await api.post("/courses/search", { skills, query, difficulty, minRating, type, limit });
  return data.data;
};

export const getCourseById = async (id) => {
  const { data } = await api.get(`/courses/${id}`);
  return data.data;
};

// { totalHours, weeks, hoursPerWeek, referencePaceHoursPerWeek, skillPlan, unmatchedSkills }
export const estimateReadiness = async ({ missingSkills, hoursPerWeek }) => {
  const { data } = await api.post("/courses/readiness", { missingSkills, hoursPerWeek });
  return data.data;
};
