import api from "./api";

export const sendChatMessage = async ({ message, studentProfile, conversationHistory }) => {
  const { data } = await api.post("/chat", { message, studentProfile, conversationHistory });
  return data.data; // { reply, intent, retrievedCareers, retrievedCourses }
};

export const getChatHistory = async () => {
  const { data } = await api.get("/chat/history");
  return data.data; // [{ role, content, createdAt }]
};

export const clearChatHistory = async () => {
  const { data } = await api.delete("/chat/history");
  return data;
};

// Attach a photo or PDF/DOCX/TXT to the chat — same "+" upload flow as the
// resume uploader, just aimed at the chat endpoint. message is an optional
// caption; the file does the rest of the talking.
export const sendChatAttachment = async ({ file, message, studentProfile, conversationHistory }) => {
  const formData = new FormData();
  formData.append("attachment", file);
  if (message) formData.append("message", message);
  formData.append("studentProfile", JSON.stringify(studentProfile || {}));
  formData.append("conversationHistory", JSON.stringify(conversationHistory || []));

  const { data } = await api.post("/chat/attachment", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data; // { reply, intent }
};
