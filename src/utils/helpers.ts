import type { ProjectPhase } from "../types";

export const GRACE_PERIOD_DAYS = 5;

export const isProjectLate = (targetDate: string): boolean => {
  const today = new Date();
  const target = new Date(targetDate);
  const diff = (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);
  return diff > GRACE_PERIOD_DAYS;
};

export const getStatusColor = (targetDate: string): string => {
  const today = new Date();
  const target = new Date(targetDate);

  const diff = (today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24);

  if (diff <= 0) return "bg-green-600"; // On time
  if (diff <= GRACE_PERIOD_DAYS) return "bg-amber-400"; // Grace Period (Amber/Yellow)
  return "bg-red-500"; // Delayed
};


export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const day = date.getDate();
  const year = date.getFullYear();

  const month = date.toLocaleString("en-US", {
    month: "long",
  });

  // Get suffix (st, nd, rd, th)
  const getSuffix = (d: number): string => {
    if (d > 3 && d < 21) return "th";
    switch (d % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };

  return `${month} ${day}${getSuffix(day)}, ${year}`;
};

export const PROJECT_PHASES: ProjectPhase[] = [
  { id: 1, name: "Requirement", weight: 7 },
  { id: 2, name: "Development", weight: 18 },
  { id: 3, name: "QA", weight: 10 },
  { id: 4, name: "Pre Prod", weight: 5 },
  { id: 5, name: "Production", weight: 10 },
  { id: 6, name: "Training", weight: 30 },
  { id: 7, name: "Handover", weight: 15 },
  { id: 8, name: "Business Use", weight: 0 },
  { id: 9, name: "Support", weight: 5 },
];

export const calculateCompletion = (phaseId: number | string): number => {
  let total = 0;
  const targetId = typeof phaseId === 'string' ? parseInt(phaseId) : phaseId;

  for (const phase of PROJECT_PHASES) {
    total += phase.weight;
    if (phase.id === targetId) break;
  }
  return total;
};

export const getPhaseName = (phaseId: number | string): string => {
  const targetId = typeof phaseId === 'string' ? parseInt(phaseId) : phaseId;
  return PROJECT_PHASES.find((p) => p.id === targetId)?.name || "Unknown";
};

export const sanitizeProject = (data: any): any => {
  const { id, ...rest } = data;
  return rest;
};