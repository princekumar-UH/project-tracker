export interface ProjectPhase {
  id: number;
  name: string;
  weight: number;
}

export interface Project {
  id: number;
  project_name: string;
  project_lead: string;
  team_size: number | string;
  start_date: string;
  target_end_date: string;
  current_phase_id: number;
  percent_complete: number;
  status_last_updated: string;
  extended_delivery_date?: string | null;
  pending_at_whom?: string | null;
}

export interface ProjectFormData extends Omit<Project, 'id' | 'percent_complete' | 'status_last_updated'> {
  id?: number;
}

export interface ReleaseItem {
  id: number;
  project_id: number;
  title: string;
  description?: string;
  created_at: string;
}

export interface ReleaseItemFormData {
  project_id: number;
  title: string;
  description?: string;
}

