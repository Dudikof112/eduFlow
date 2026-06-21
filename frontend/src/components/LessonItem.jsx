export default function LessonItem({ lesson }) {
  return (
    <div
      style={{
        padding: 10,
        borderBottom: "1px solid #eee"
      }}
    >
      🎓 {lesson.title}
    </div>
  );
}