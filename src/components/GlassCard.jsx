export default function GlassCard({ as: Tag = "section", className = "", children, ...props }) {
  return (
    <Tag
      className={`rounded-2xl border border-slate-300/25 bg-slate-950/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_24px_60px_-32px_rgba(139,92,246,0.9)] backdrop-blur-md ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
