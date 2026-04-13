export interface PriceRange {
  min: number;
  max: number;
  suggested: number;
  confidence: number;
  trend: "rising" | "stable" | "falling";
  competitorAvg: number;
  occupancyRate: number;
  demandScore: number;
}

export interface FactorItem {
  label: string;
  impact: "high" | "medium" | "low";
  direction: "positive" | "negative" | "neutral";
  description: string;
}