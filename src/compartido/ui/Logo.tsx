import { cn } from '../utilidades'

/** Marca "C" de Cambridge Academy. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg bg-white/15 font-bold text-white',
        className ?? 'size-9 text-[17px]',
      )}
      aria-hidden
    >
      C
    </span>
  )
}
