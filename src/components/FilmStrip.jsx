export default function FilmStrip() {
  return (
    <div className="film-strip">
      <div className="film-holes" style={{ animationDirection: "reverse" }}>
        {Array.from({ length: 60 }).map((_, i) => (
          <div key={i} className="film-hole"></div>
        ))}
      </div>
    </div>
  );
}
