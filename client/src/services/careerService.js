import api from "./api";

export const analyzeCareer = async (studentProfile) => {
  const { data } = await api.post("/career/analyze", studentProfile);
  return data.data; // { matches, analyzedAt }
};

// "Type any career" mode — for a career outside the curated list.
export const analyzeCustomCareer = async (careerName, studentProfile) => {
  const { data } = await api.post("/career/custom", { careerName, ...studentProfile });
  return data.data; // { match, career, source: "curated" | "ai-generated" }
};

export const getAllCareers = async () => {
  const { data } = await api.get("/careers");
  return data.data;
};

export const getCareerById = async (id) => {
  const { data } = await api.get(`/careers/${id}`);
  return data.data;
};

export const updateProfile = async (profileFields) => {
  const { data } = await api.post("/profile", profileFields);
  return data.data;
};

export const getDashboard = async () => {
  const { data } = await api.get("/user/dashboard");
  return data.data;
};

export const parseResumeFile = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  // Override the default JSON content-type from the shared axios instance —
  // axios sets the correct multipart boundary automatically as long as we
  // don't pin a content-type ourselves.
  const { data } = await api.post("/profile/from-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data; // extracted profile — not yet saved
};

export const toggleSkillCompletion = async (skill, completed) => {
  const { data } = await api.post("/profile/skills/toggle", { skill, completed });
  return data.data; // updated profile, including skillTimestamps
};
