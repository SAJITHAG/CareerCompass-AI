import api from "./api";

export const registerUser = async ({ name, email, password }) => {
  const { data } = await api.post("/auth/register", { name, email, password });
  return data.data; // { token, user }
};

export const loginUser = async ({ email, password }) => {
  const { data } = await api.post("/auth/login", { email, password });
  return data.data; // { token, user }
};

export const getCurrentUser = async () => {
  const { data } = await api.get("/auth/me");
  return data.data;
};
