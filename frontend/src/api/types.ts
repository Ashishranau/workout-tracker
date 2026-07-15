export type Sex = "male" | "female";

export interface User {
  id: number;
  email: string;
  sex: Sex;
  created_at: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export type ExerciseCategory = "barbell" | "dumbbell" | "bodyweight" | "machine";

export interface Exercise {
  id: number;
  name: string;
  category: ExerciseCategory;
  primary_muscle_group: string | null;
}

export interface WorkoutSet {
  id: number;
  exercise_id: number;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe: number | null;
  created_at: string;
}

export interface WorkoutSetCreate {
  exercise_id: number;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe?: number | null;
}

export interface WorkoutSession {
  id: number;
  date: string;
  notes: string | null;
  created_at: string;
  sets: WorkoutSet[];
}

export interface WorkoutSessionCreate {
  date: string;
  notes?: string | null;
}

export interface BodyweightLog {
  id: number;
  date: string;
  weight_kg: number;
  created_at: string;
}

export interface BodyweightLogCreate {
  date: string;
  weight_kg: number;
}

export interface OneRepMaxResult {
  epley: number;
  brzycki: number;
  average: number;
}

export interface OneRepMaxHistoryPoint {
  date: string;
  estimated_one_rep_max: number;
  rpe: number | null;
  bodyweight_kg: number | null;
}

export interface PlateauResult {
  is_plateaued: boolean;
  slope_per_week: number;
  percent_change_per_week: number;
  sessions_used: number;
  history: OneRepMaxHistoryPoint[];
}

export interface StrengthStandardResult {
  tier: string;
  bodyweight_ratio: number;
  bodyweight_kg: number;
  estimated_one_rep_max: number;
}

export interface CurrentStrengthStandardResult extends StrengthStandardResult {
  as_of_date: string;
}
