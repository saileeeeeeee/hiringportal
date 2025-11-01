/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// User Types
export interface User {
  emp_id: number;
  username: string;
  email: string;
  role: "HR" | "Manager" | "Management";
  full_name?: string;
  department?: string;
  designation?: string;
  status: "active" | "inactive";
  last_login?: string;
}

export interface UserCreate {
  emp_id: number;
  username: string;
  password_hash: string;
  email: string;
  role: "HR" | "Manager" | "Management";
  full_name?: string;
  department?: string;
  designation?: string;
  status?: "active" | "inactive";
  last_login?: string;
}

// Job Types
export interface Job {
  job_id: number;
  created_by: number;
  title: string;
  job_code?: string;
  department?: string;
  location?: string;
  employment_type?: "Full-time" | "Part-time" | "Contract" | "Internship";
  experience_required?: string;
  salary_range?: string;
  jd?: string;
  key_skills?: string;
  additional_skills?: string;
  openings?: number;
  posted_date: string;
  closing_date?: string;
  status: "open" | "on_hold" | "closed";
  approved_by?: number;
  approved_date?: string;
}

export interface JobCreate {
  created_by: number;
  title: string;
  job_code?: string;
  department?: string;
  location?: string;
  employment_type?: string;
  experience_required?: string;
  salary_range?: string;
  jd?: string;
  key_skills?: string;
  additional_skills?: string;
  openings?: number;
  posted_date?: string;
  closing_date?: string;
  status?: string;
  approved_by?: number;
  approved_date?: string;
}

// Applicant Types
export interface Applicant {
  applicant_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  resume_url: string;
  experience_years?: number;
  education?: string;
  current_company?: string;
  current_role?: string;
  expected_ctc?: number;
  notice_period_days?: number;
  skills?: string;
  location?: string;
}

// Application Types
export interface Application {
  application_id: number;
  applicant_id: number;
  job_id: number;
  application_status: string;
  source?: string;
  semantic_score?: number;
  keyword_score?: number;
  final_score?: number;
  assigned_hr?: number;
  assigned_manager?: number;
  comments?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ApplicationWithApplicant extends Application {
  applicant: Applicant;
}
