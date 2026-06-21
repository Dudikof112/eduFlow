import { useEffect, useState } from "react";
import { getCourseDashboard } from "../api/courseApi";

const CourseDashboard = ({ courseId }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");

        const result = await getCourseDashboard(courseId, token);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div style={{ padding: "20px" }}>
      {/* COURSE HEADER */}
      <h1>{data.course.title}</h1>
      <p>Creator: {data.course.User?.email}</p>

      {/* ENROLLMENT */}
      <h3>
        Enrolled users: {data.enrolledCount}
      </h3>

      {/* PROGRESS */}
      <div style={{ marginTop: "20px" }}>
        <h2>Progress</h2>
        <p>
          {data.progress.done} / {data.progress.total}
        </p>
        <h3>{data.progress.percent}%</h3>

        <div style={{ width: "100%", background: "#eee" }}>
          <div
            style={{
              width: `${data.progress.percent}%`,
              height: "10px",
              background: "green"
            }}
          />
        </div>
      </div>

      {/* RATING */}
      <div style={{ marginTop: "20px" }}>
        <h2>Rating</h2>
        <p>⭐ {data.rating.avg} / 5</p>
        <p>Reviews: {data.rating.count}</p>
      </div>

      {/* LESSONS */}
      <div style={{ marginTop: "20px" }}>
        <h2>Lessons</h2>

        {data.lessons.map((lesson) => (
          <div
            key={lesson.id}
            style={{
              padding: "10px",
              marginBottom: "5px",
              background: lesson.completed ? "#d4ffd4" : "#f2f2f2"
            }}
          >
            {lesson.title}{" "}
            {lesson.completed ? "✔" : "⏳"}
          </div>
        ))}
      </div>

      {/* COMMENTS */}
      <div style={{ marginTop: "20px" }}>
        <h2>Comments</h2>

        {data.comments.map((c) => (
          <div key={c.id} style={{ marginBottom: "10px" }}>
            <b>{c.User?.email}</b>
            <p>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseDashboard;