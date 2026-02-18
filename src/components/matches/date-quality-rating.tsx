"use client";

import { ChevronDown } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export interface DateQualityRatings {
  conversationQuality: number;
  longTermPotential: number;
  physicalChemistry: number;
  comfortLevel: number;
  valuesAlignment: number;
  energyCompatibility: number;
}

export const DEFAULT_RATINGS: DateQualityRatings = {
  conversationQuality: 3,
  longTermPotential: 3,
  physicalChemistry: 3,
  comfortLevel: 3,
  valuesAlignment: 3,
  energyCompatibility: 3,
};

interface RatingSliderConfig {
  key: keyof DateQualityRatings;
  label: string;
  lowLabel: string;
  highLabel: string;
}

const RATING_SLIDERS: RatingSliderConfig[] = [
  {
    key: "conversationQuality",
    label: "Conversation Quality",
    lowLabel: "Awkward",
    highLabel: "Great flow",
  },
  {
    key: "longTermPotential",
    label: "Long-Term Potential",
    lowLabel: "None",
    highLabel: "Very promising",
  },
  {
    key: "physicalChemistry",
    label: "Physical Chemistry",
    lowLabel: "None",
    highLabel: "Strong",
  },
  {
    key: "comfortLevel",
    label: "Comfort Level",
    lowLabel: "Uncomfortable",
    highLabel: "Very comfortable",
  },
  {
    key: "valuesAlignment",
    label: "Values Alignment",
    lowLabel: "Very different",
    highLabel: "Aligned",
  },
  {
    key: "energyCompatibility",
    label: "Energy Compatibility",
    lowLabel: "Mismatch",
    highLabel: "Compatible",
  },
];

interface DateQualityRatingProps {
  ratings: DateQualityRatings;
  onChange: (ratings: DateQualityRatings) => void;
  expanded: boolean;
  onToggle: () => void;
}

export function DateQualityRating({
  ratings,
  onChange,
  expanded,
  onToggle,
}: DateQualityRatingProps) {
  function handleSliderChange(key: keyof DateQualityRatings, value: number[]): void {
    onChange({ ...ratings, [key]: value[0] });
  }

  return (
    <div className="rounded-lg border bg-card">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/50 transition-colors"
      >
        <span>Rate Your Experience</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted-foreground transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-4 px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {RATING_SLIDERS.map(({ key, label, lowLabel, highLabel }) => (
            <div key={key} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">
                  {label}
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {ratings[key]}/5
                </span>
              </div>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[ratings[key]]}
                onValueChange={(value) => handleSliderChange(key, value)}
              />
              <div className="flex justify-between">
                <span className="text-[10px] text-muted-foreground">
                  {lowLabel}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {highLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
