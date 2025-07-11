// Part Number Analysis form constants

export const FEASIBILITY_OPTIONS = [
  "NA",
  "CAN NOT DO", 
  "CAN DO"
] as const;

export const REASON_FEASIBILITY_OPTIONS = [
  "Not HPDC",
  "Other HPDC",
  "NA"
] as const;

export const RUNNER_OPTIONS = [
  "Hot Runner",
  "Cold Runner", 
  "DIE CASTING",
  "CAN DO"
] as const;

export const MOLD_STEEL_CORE_OPTIONS = [
  "ASSAB Uddeholms Dievar/1.2343"
] as const;

export type FeasibilityOption = typeof FEASIBILITY_OPTIONS[number];
export type ReasonFeasibilityOption = typeof REASON_FEASIBILITY_OPTIONS[number];
export type RunnerOption = typeof RUNNER_OPTIONS[number];
export type MoldSteelCoreOption = typeof MOLD_STEEL_CORE_OPTIONS[number]; 