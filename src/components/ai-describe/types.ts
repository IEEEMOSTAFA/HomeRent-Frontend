// ─────────────────────────────────────────────────────────────────────────────
// Shared Types — RentHome landing page
// ─────────────────────────────────────────────────────────────────────────────

export type RoleCard = {
  icon: React.ReactNode;
  role: string;
  tagline: string;
  color: string;
  borderColor: string;
  glowColor: string;
  badgeColor: string;
  capabilities: string[];
  apis: string[];
};

export type WorkflowStep = {
  actor: "OWNER" | "ADMIN" | "USER" | "SYSTEM";
  action: string;
  description: string;
};

export type StatItem = {
  value: number;
  suffix: string;
  label: string;
  icon: React.ReactNode;
  isFloat?: boolean;
};

export type FeatureBlock = {
  icon: React.ReactNode;
  title: string;
  description: string;
  tags: string[];
  color: string;
};