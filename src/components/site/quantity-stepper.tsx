"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  canDecreaseQuantity,
  canIncreaseQuantity,
  getDecreaseLimitMessage,
  getIncreaseLimitMessage,
  resolveStockQty,
  type QuantityLimitContext,
} from "@/lib/quantity-helper";

type QuantityStepperProps = {
  quantity: number;
  stockQty: number | null | undefined;
  context: QuantityLimitContext;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  size?: "md" | "sm";
};

function LimitTooltip({
  message,
  active,
  children,
}: {
  message: string;
  active: boolean;
  children: React.ReactNode;
}) {
  if (!active) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex cursor-not-allowed">{children}</span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-center">
        {message}
      </TooltipContent>
    </Tooltip>
  );
}

export function QuantityStepper({
  quantity,
  stockQty,
  context,
  disabled = false,
  onDecrease,
  onIncrease,
  size = "md",
}: QuantityStepperProps) {
  const stock = resolveStockQty(stockQty);
  const canDecrease = !disabled && canDecreaseQuantity(quantity);
  const canIncrease = !disabled && canIncreaseQuantity(quantity, stockQty);
  const decreaseMessage = getDecreaseLimitMessage(context);
  const increaseMessage =
    stock !== null && stock >= 1 ? getIncreaseLimitMessage(stock) : "";

  const iconClass = size === "sm" ? "size-9 rounded-none" : "size-10 rounded-none";
  const minWidth = size === "sm" ? "min-w-9" : "min-w-10";

  return (
    <div className="inline-flex items-center rounded-md border border-border bg-background">
      <LimitTooltip message={decreaseMessage} active={!canDecrease && !disabled}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={iconClass}
          disabled={!canDecrease}
          onClick={() => {
            if (canDecrease) onDecrease();
          }}
          aria-label="Decrease quantity"
        >
          <Minus className="size-4 pointer-events-none" />
        </Button>
      </LimitTooltip>
      <span
        className={`${minWidth} text-center text-sm font-medium tabular-nums text-foreground`}
      >
        {quantity}
      </span>
      <LimitTooltip
        message={increaseMessage}
        active={!canIncrease && !disabled && increaseMessage.length > 0}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={iconClass}
          disabled={!canIncrease}
          onClick={() => {
            if (canIncrease) onIncrease();
          }}
          aria-label="Increase quantity"
        >
          <Plus className="size-4 pointer-events-none" />
        </Button>
      </LimitTooltip>
    </div>
  );
}
