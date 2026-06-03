export function TicketNumber({ value, className }: { value: string; className?: string }) {
  return <span className={`font-mono text-caption text-ink-2 ${className ?? ""}`}>{value}</span>;
}
