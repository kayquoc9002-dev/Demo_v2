// ─── Skeleton primitives ──────────────────────────────────
const Bone = ({ className = "" }: { className?: string }) => (
  <div className={`rounded-lg bg-slate-800/60 animate-pulse ${className}`} />
);

// ─── Card skeleton (dùng cho KhachHang, DoiTac, NhaPhanPhoi, NhanVien) ──
export const SkeletonCard = () => (
  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 space-y-3">
    {/* Header row */}
    <div className="flex items-center gap-3">
      <Bone className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Bone className="h-3.5 w-2/3" />
        <Bone className="h-2.5 w-1/3" />
      </div>
      <Bone className="h-5 w-14 rounded-full" />
    </div>
    {/* Body rows */}
    <div className="space-y-2 pt-1">
      <Bone className="h-2.5 w-full" />
      <Bone className="h-2.5 w-4/5" />
    </div>
    {/* Footer row */}
    <div className="flex items-center justify-between pt-1">
      <Bone className="h-2.5 w-1/4" />
      <div className="flex gap-2">
        <Bone className="w-7 h-7 rounded-lg" />
        <Bone className="w-7 h-7 rounded-lg" />
        <Bone className="w-7 h-7 rounded-lg" />
      </div>
    </div>
  </div>
);

// ─── Stat card skeleton ───────────────────────────────────
export const SkeletonStat = () => (
  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
    <Bone className="w-10 h-10 rounded-xl flex-shrink-0" />
    <div className="space-y-2 flex-1">
      <Bone className="h-5 w-12" />
      <Bone className="h-2.5 w-20" />
    </div>
  </div>
);

// ─── Grid skeleton (n cards) ──────────────────────────────
export const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// ─── Stat row skeleton ────────────────────────────────────
export const SkeletonStatRow = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonStat key={i} />
    ))}
  </div>
);
