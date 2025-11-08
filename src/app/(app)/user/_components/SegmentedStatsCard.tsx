export function SegmentedStatsCard({
  title,
  total,
  segments,
  items,
}: {
  title: string
  total?: string
  segments: { bg: string; color: string; width: string }[]
  items: { dot: string; label: string; value: string }[]
}) {
  return (
    <div className="rounded-[12px] border border-[#E9EEF3] bg-white p-4 shadow-[0_1px_0_0_rgba(16,24,40,.04)]">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-hnd text-[14px]/[18px] font-normal tracking-[-0.5px] text-[#7A7A7A]">
          {title}
        </h3>
        {total ? (
          <span className="font-hnd text-[14px]/[18px] font-bold text-[#101828] tracking-[-0.5px]">
            {total}
          </span>
        ) : null}
      </div>

      {/* Segmented progress rail (height=6px, gap=8px) */}
      <div className="mb-4 flex h-1.5 w-full items-center gap-2 overflow-hidden rounded-tl-[100px] rounded-bf-[100px] bg-[#EEF2F6]">
        {segments.map((s, i) => (
          <span
            key={`${s.color}-${i}`}
            style={{
              width: s.width,
              backgroundImage: `repeating-linear-gradient(
                90deg,
                ${s.bg},
                ${s.bg} 4px,
                ${s.color} 1.5px,
                ${s.color} 8px
              )`,
            }}
            // style={{ backgroundColor: s.color, width: s.width }}
            className="h-full rounded-full"
          />
        ))}
      </div>

      {/* Mini stats grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex flex-col gap-[9px] h-[79px] rounded-xl border border-[#F2F2F2] bg-white p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: it.dot }}
              />
              <span className="font-hnd font-semibold text-[14px]/[18px] tracking-[-0.5px] text-[#7A7A7A]">
                {it.label}
              </span>
            </div>
            <div className="font-hnd text-[20px]/[28px] font-medium tracking-[-1px] text-[#242424]">
              {it.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
