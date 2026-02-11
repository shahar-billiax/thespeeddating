"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PRESET_COLORS = [
  // Row 1 — neutrals
  "#000000", "#434343", "#666666", "#999999", "#cccccc",
  // Row 2 — warm
  "#e03131", "#e8590c", "#f08c00", "#fab005", "#82c91e",
  // Row 3 — cool
  "#40c057", "#12b886", "#15aabf", "#228be6", "#4263eb",
  // Row 4 — purples / pinks
  "#7048e8", "#9c36b5", "#c2255c", "#a61e4d", "#862e9c",
];

interface EditorColorPickerProps {
  /** Current active color (hex or empty) */
  currentColor: string | undefined;
  /** Called when user picks a color */
  onSelectColor: (color: string) => void;
  /** Called when user removes color */
  onRemoveColor: () => void;
  /** Icon element shown in the trigger button */
  icon: React.ReactNode;
  /** Tooltip label */
  tooltip: string;
}

export function EditorColorPicker({
  currentColor,
  onSelectColor,
  onRemoveColor,
  icon,
  tooltip,
}: EditorColorPickerProps) {
  const customInputRef = useRef<HTMLInputElement>(null);

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex flex-col items-center justify-center gap-0"
            >
              <span className="flex items-center justify-center h-5">
                {icon}
              </span>
              <span
                className="h-1 w-4 rounded-full"
                style={{
                  backgroundColor: currentColor || "transparent",
                  border: currentColor ? "none" : "1px solid hsl(var(--border))",
                }}
              />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>

      <PopoverContent className="w-auto p-3" align="start">
        <div className="grid grid-cols-5 gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className="h-6 w-6 rounded border border-border hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              style={{ backgroundColor: color }}
              onClick={() => onSelectColor(color)}
              title={color}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          <button
            type="button"
            onClick={onRemoveColor}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            No color
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Custom:</span>
            <button
              type="button"
              className="h-6 w-6 rounded border border-border overflow-hidden relative"
              style={{ backgroundColor: currentColor || "#000000" }}
              onClick={() => customInputRef.current?.click()}
              title="Pick custom color"
            >
              <input
                ref={customInputRef}
                type="color"
                value={currentColor || "#000000"}
                onChange={(e) => onSelectColor(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                tabIndex={-1}
              />
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
