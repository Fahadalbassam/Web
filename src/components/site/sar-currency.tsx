import { cn } from "@/lib/utils";

type SarCurrencyProps = {
  amount: number;
  className?: string;
  symbolClassName?: string;
};

export function SarCurrency({ amount, className, symbolClassName }: SarCurrencyProps) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)} title={`${amount.toFixed(2)} SAR`}>
      <img
        src="/images/ryal-symbol.svg"
        alt=""
        aria-hidden
        decoding="async"
        className={cn("inline-block h-[1em] w-auto shrink-0 object-contain", symbolClassName)}
      />
      <span className="tabular-nums">{amount.toFixed(2)}</span>
    </span>
  );
}
