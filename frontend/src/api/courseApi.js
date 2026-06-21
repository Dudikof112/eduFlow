const API_URL = "http://localhost:5000";

export const getCourseDashboard = async (courseId, token) => {
  const res = await fetch(`${API_URL}/courses/${courseId}/dashboard`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard");
  }

  return await res.json();
};