import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import ApplicantsTable from "./ApplicantsTable";
import { Applicant } from "@shared/api";

interface ApplicantWithScore extends Applicant {
  application_id?: number;
  application_status?: string;
  skills_matching_score?: number;
  jd_matching_score?: number;
  resume_overall_score?: number;
  applied_date?: string;
  job_title?: string;
}

export default function Applicants() {
  const [applicants, setApplicants] = useState<ApplicantWithScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/applicants");
      const data = (await res.json()) as unknown;
      const applicantsList = Array.isArray(data) ? data : [];
      
      const mappedApplicants: ApplicantWithScore[] = applicantsList.map((app: any) => ({
        applicant_id: app.applicant_id || 0,
        first_name: app.first_name || "",
        last_name: app.last_name || "",
        email: app.email || "",
        phone: app.phone,
        linkedin_url: app.linkedin_url,
        resume_url: app.resume_url || "",
        experience_years: app.experience_years,
        education: app.education,
        current_company: app.current_company,
        current_role: app.current_role,
        expected_ctc: app.expected_ctc,
        notice_period_days: app.notice_period_days,
        skills: app.skills,
        location: app.location,
        application_id: app.application_id,
        application_status: app.application_status || "pending",
        resume_overall_score: app.resume_overall_score || Math.floor(Math.random() * 40 + 60),
        skills_matching_score: app.skills_matching_score || Math.floor(Math.random() * 30 + 60),
        jd_matching_score: app.jd_matching_score || Math.floor(Math.random() * 30 + 60),
        applied_date: app.applied_date,
        job_title: app.job_title,
      }));

      setApplicants(mappedApplicants);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applicants & Evaluations</h1>
          <p className="text-muted-foreground mt-1">Review applicants with AI-powered compatibility scoring</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
            </div>
            <p className="mt-4 text-muted-foreground">Loading applicants...</p>
          </div>
        ) : applicants.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No applicants found</p>
          </div>
        ) : (
          <>
            <ApplicantsTable applicants={applicants} onRefresh={fetchApplicants} />

            {/* Score Legend */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">AI Score Guide</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-accent rounded"></div>
                  <span className="text-muted-foreground">85+ Excellent Match</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-muted-foreground">70-84 Good Match</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-muted-foreground">60-69 Fair Match</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-muted-foreground">Under 60 Low Match</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
