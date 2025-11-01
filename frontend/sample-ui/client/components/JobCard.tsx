import { Link } from 'react-router-dom';
import { MapPin, Briefcase, DollarSign, Users, ChevronRight } from 'lucide-react';
import { Job } from '@shared/api';

interface JobCardProps {
  job: Job;
  variant?: 'compact' | 'detailed';
  showApplyButton?: boolean;
}

export default function JobCard({ job, variant = 'detailed', showApplyButton = true }: JobCardProps) {
  if (variant === 'compact') {
    return (
      <Link
        to={`/jobs/${job.job_id}`}
        className="bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/20 transition-all duration-300 group"
      >
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
          {job.title}
        </h3>
        {job.department && (
          <p className="text-sm text-muted-foreground mt-1">{job.department}</p>
        )}
        {job.location && (
          <p className="text-sm text-muted-foreground">📍 {job.location}</p>
        )}
      </Link>
    );
  }

  return (
    <Link
      to={`/jobs/${job.job_id}`}
      className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group"
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
            {job.title}
          </h3>

          <div className="flex flex-wrap gap-3 mb-3 text-sm text-muted-foreground">
            {job.department && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.department}
              </div>
            )}
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
            )}
            {job.salary_range && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {job.salary_range}
              </div>
            )}
          </div>

          {job.jd && (
            <p className="text-muted-foreground line-clamp-2">{job.jd}</p>
          )}

          {job.key_skills && (
            <div className="mt-3 flex flex-wrap gap-2">
              {job.key_skills.split(',').slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium"
                >
                  {skill.trim()}
                </span>
              ))}
              {job.key_skills.split(',').length > 3 && (
                <span className="text-xs text-muted-foreground pt-1">
                  +{job.key_skills.split(',').length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-2">
          {job.employment_type && (
            <span className="bg-accent/10 text-accent px-4 py-2 rounded-lg text-sm font-medium">
              {job.employment_type}
            </span>
          )}
          {job.openings && (
            <span className="text-sm text-muted-foreground">
              {job.openings} position{job.openings !== 1 ? 's' : ''} open
            </span>
          )}
          {showApplyButton && (
            <Link
              to={`/apply/${job.job_id}`}
              onClick={(e) => e.preventDefault()}
              className="text-primary font-medium text-sm mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all"
            >
              Apply Now
              <ChevronRight className="w-4 h-4 transform group-hover:rotate-90 transition-transform" />
            </Link>
          )}
        </div>
      </div>
    </Link>
  );
}
