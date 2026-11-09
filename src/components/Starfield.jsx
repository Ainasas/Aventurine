const STARS = Array.from({ length: 56 }, (_, index) => ({
  id: index,
  left: (index * 47) % 100,
  top: (index * 29) % 100,
  size: (index % 3) + 1,
  opacity: 0.25 + (index % 5) * 0.12,
}));

export default function Starfield() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
      {STARS.map((star) => (
        <span
          key={star.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${star.left}%`,
            top: `${star.top}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
          }}
        />
      ))}
      <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-violet-600/20 blur-3xl" />
      <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
    </div>
  );
}
