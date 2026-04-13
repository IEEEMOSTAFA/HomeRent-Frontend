// ─── Avatar ───────────────────────────────────────────────────────────────────
export function Avatar({ name, src }: { name: string; src?: string }) {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-emerald-500 to-teal-600",
    "from-orange-500 to-amber-600",
    "from-sky-500 to-blue-600",
    "from-pink-500 to-rose-600",
  ];
  const idx = (name?.charCodeAt(0) ?? 0) % gradients.length;
  return src ? (
    <img src={src} className="w-11 h-11 rounded-full object-cover ring-2 ring-border" alt={name} />
  ) : (
    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${gradients[idx]} flex items-center justify-center text-white font-bold text-base ring-2 ring-border`}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}