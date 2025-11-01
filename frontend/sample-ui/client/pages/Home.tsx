import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, Users, Zap, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
import { jobsAPI } from '@/lib/api';
import { Job } from '@shared/api';
import Navbar from '@/components/Navbar';

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedJobs = async () => {
      try {
        const response = await jobsAPI.getPublicJobs();
        const jobs = response.data.active_jobs || [];
        setFeaturedJobs(jobs.slice(0, 3));
      } catch (error) {
        console.error('Error fetching featured jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeaturedJobs();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  Build Your Career at{' '}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    UBTI
                  </span>
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  Discover exciting opportunities and join a team of talented professionals dedicated to innovation and excellence.
                </p>
              </div>

              <div className="flex gap-4">
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                >
                  Explore Jobs
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/jobs"
                  className="inline-flex items-center gap-2 border border-border px-8 py-3 rounded-lg font-medium hover:bg-secondary transition-colors"
                >
                  Learn More
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-6">
                <div>
                  <p className="text-2xl font-bold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">10k+</p>
                  <p className="text-sm text-muted-foreground">Applicants</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">25+</p>
                  <p className="text-sm text-muted-foreground">Departments</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 border border-primary/20">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-primary/20 rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Why Choose UBTI?</h2>
            <p className="text-lg text-muted-foreground">We offer competitive benefits and a great work environment</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Briefcase, title: 'Diverse Roles', desc: 'Explore roles across multiple departments' },
              { icon: Zap, title: 'AI Matching', desc: 'Smart matching algorithm for best fit' },
              { icon: Users, title: 'Great Team', desc: 'Work with talented and supportive colleagues' },
              { icon: Globe, title: 'Global Impact', desc: 'Be part of a global organization' },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-slide-up"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Featured Opportunities</h2>
              <p className="text-lg text-muted-foreground">Some of our latest openings</p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
            >
              View All Jobs
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading featured jobs...</div>
          ) : featuredJobs.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <p className="text-muted-foreground mb-4">No jobs available at the moment</p>
              <p className="text-sm text-muted-foreground">Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <Link
                  key={job.job_id}
                  to={`/jobs/${job.job_id}`}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300 group hover:-translate-y-1 animate-slide-up"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {job.title}
                      </h3>
                      {job.department && (
                        <p className="text-sm text-muted-foreground mt-1">{job.department}</p>
                      )}
                    </div>
                    {job.openings && (
                      <span className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
                        {job.openings} position{job.openings !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {job.location && (
                    <p className="text-sm text-muted-foreground mb-4">📍 {job.location}</p>
                  )}

                  {job.employment_type && (
                    <p className="text-sm text-muted-foreground mb-4">{job.employment_type}</p>
                  )}

                  {job.jd && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{job.jd}</p>
                  )}

                  <div className="pt-4 border-t border-border">
                    <span className="text-primary font-medium text-sm group-hover:gap-2 inline-flex items-center gap-1 transition-all">
                      Apply Now
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border rounded-xl p-12 space-y-6">
            <h2 className="text-3xl font-bold text-foreground">About UBTI</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              UBTI is a leading organization committed to innovation, excellence, and employee development. 
              We believe in creating a workplace where diverse talents can thrive and contribute meaningfully 
              to our mission of delivering exceptional solutions to our clients.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Our hiring portal showcases opportunities across various departments and roles. We use AI-powered 
              matching to ensure the best fit between candidates and positions, making the recruitment process 
              fair, efficient, and transparent.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Ready to Join Our Team?</h2>
          <p className="text-lg text-muted-foreground">
            Explore our job openings and submit your application today
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Browse All Jobs
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-foreground mb-4">UBTI</h3>
              <p className="text-sm text-muted-foreground">Building careers, Creating opportunities</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-foreground transition-colors">Home</Link></li>
                <li><Link to="/jobs" className="hover:text-foreground transition-colors">Jobs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Recruitment</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/jobs" className="hover:text-foreground transition-colors">Browse Jobs</Link></li>
                <li><Link to="/jobs" className="hover:text-foreground transition-colors">Apply Now</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">HR Portal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/login" className="hover:text-foreground transition-colors">HR Login</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 UBTI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
