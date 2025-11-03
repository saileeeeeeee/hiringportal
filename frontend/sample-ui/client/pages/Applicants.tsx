// src/pages/Applicants.tsx
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import ApplicantsTable from "./ApplicantsTable";
import { applicantsAPI } from "@/lib/api";
import { toast } from "sonner";

console.log("Applicants.tsx: File loaded");

// FULL TYPE FROM BACKEND
interface ApplicantWithScore {
  // === APPLICATION FIELDS ===
  application_id: number | null;
  job_id: number | null;
  applied_date: string | null;
  source: string | null;
  skills_matching_score: number | null;
  jd_matching_score: number | null;
  resume_overall_score: number | null;
  application_status: string | null;
  assigned_hr: string | null;
  assigned_manager: string | null;
  comments: string | null;
  updated_at: string | null;

  // === APPLICANT PROFILE ===
  applicant_id: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  linkedin_url: string | null;
  resume_url: string | null;
  experience_years: number | null;
  education: string | null;
  current_company: string | null;
  current_role: string | null;
  expected_ctc: number | null;
  notice_period_days: number | null;
  skills: string | null;
  location: string | null;
  created_at: string | null;
  applicant_updated_at: string | null;
}

export default function Applicants() {
  console.log("Applicants.tsx: Component mounted");

  const [applicants, setApplicants] = useState<ApplicantWithScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Applicants.tsx: useEffect → fetch");
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      console.log("Fetching...");
      setLoading(true);
      const res = await applicantsAPI.getApplicants();
      console.log("API Response:", res);

      const data = Array.isArray(res.data) ? res.data : [];

      const mapped: ApplicantWithScore[] = data.map((app: any) => ({
        // Application
        application_id: app.application_id ?? null,
        job_id: app.job_id ?? null,
        applied_date: app.applied_date ?? null,
        source: app.source ?? null,
        skills_matching_score: app.skills_matching_score != null ? Number(app.skills_matching_score) : null,
        jd_matching_score: app.jd_matching_score != null ? Number(app.jd_matching_score) : null,
        resume_overall_score: app.resume_overall_score != null ? Number(app.resume_overall_score) : null,
        application_status: app.application_status ?? "pending",
        assigned_hr: app.assigned_hr ?? null,
        assigned_manager: app.assigned_manager ?? null,
        comments: app.comments ?? null,
        updated_at: app.updated_at ?? null,

        // Applicant
        applicant_id: app.applicant_id ?? null,
        first_name: app.first_name ?? null,
        last_name: app.last_name ?? null,
        email: app.email ?? null,
        phone: app.phone ?? null,
        linkedin_url: app.linkedin_url ?? null,
        resume_url: app.resume_url ?? null,
        experience_years: app.experience_years != null ? Number(app.experience_years) : null,
        education: app.education ?? null,
        current_company: app.current_company ?? null,
        current_role: app.current_role ?? null,
        expected_ctc: app.expected_ctc != null ? Number(app.expected_ctc) : null,
        notice_period_days: app.notice_period_days != null ? Number(app.notice_period_days) : null,
        skills: app.skills ?? null,
        location: app.location ?? null,
        created_at: app.created_at ?? null,
        applicant_updated_at: app.applicant_updated_at ?? null,
      }));

      console.log("Mapped:", mapped);
      setApplicants(mapped);
    } catch (error: any) {
      console.error("Fetch failed:", error);
      toast.error("Failed to load applicants");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applicants & Evaluations</h1>
          <p className="text-muted-foreground mt-1">
            Review applicants with AI-powered compatibility scoring
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
            </div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        ) : applicants.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No applicants found</p>
          </div>
        ) : (
          // NO RED LINE — TYPE MATCHES
          <ApplicantsTable applicants={applicants} onRefresh={fetchApplicants} />
        )}
      </div>
    </div>
  );
}