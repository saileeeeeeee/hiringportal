import { useState, useEffect } from 'react';
import { Calendar, MapPin, User, Filter, Search, MoreVertical } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { interviewsAPI } from '@/lib/api';

interface Interview {
  schedule_id: number;
  application_id: number;
  round_number: number;
  round_type: string;
  scheduled_date: string;
  duration_minutes: number;
  interviewer_ids: string;
  manager_id?: number;
  meeting_link?: string;
  location: string;
  schedule_status: string;
  remarks?: string;
  created_at?: string;
  applicant_name?: string;
  job_title?: string;
}

export default function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewsAPI.getSchedules();
      setInterviews(response.data || []);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews
    .filter((interview) => {
      const searchStr = `${interview.applicant_name} ${interview.job_title}`.toLowerCase();
      return searchStr.includes(searchTerm.toLowerCase());
    })
    .filter((interview) => {
      if (filterStatus === 'all') return true;
      return interview.schedule_status === filterStatus;
    })
    .sort((a, b) => new Date(b.scheduled_date).getTime() - new Date(a.scheduled_date).getTime());

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-2">Interview Schedules</h1>
          <p className="text-lg text-muted-foreground">
            Manage and track all scheduled interviews
          </p>
        </div>

        {/* Toolbar */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="md:col-span-2 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by applicant name or job title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="rescheduled">Rescheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Interviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full"></div>
            </div>
            <p className="mt-4 text-muted-foreground">Loading interviews...</p>
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground mb-2">No interviews found</p>
            <p className="text-muted-foreground">No scheduled interviews matching your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <div
                key={interview.schedule_id}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 animate-slide-up"
              >
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      {interview.applicant_name}
                    </h3>
                    <p className="text-muted-foreground">{interview.job_title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.schedule_status)}`}>
                      {interview.schedule_status}
                    </span>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                  {/* Round */}
                  <div>
                    <p className="text-muted-foreground mb-1">Round</p>
                    <p className="font-medium text-foreground">
                      Round {interview.round_number} - {interview.round_type}
                    </p>
                  </div>

                  {/* Date/Time */}
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <div>
                      <p className="text-muted-foreground mb-1">Scheduled Date</p>
                      <p className="font-medium text-foreground">
                        {formatDateTime(interview.scheduled_date)}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <p className="text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium text-foreground">{interview.duration_minutes} minutes</p>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground mb-1">Location</p>
                      <p className="font-medium text-foreground">{interview.location}</p>
                    </div>
                  </div>
                </div>

                {/* Meeting Link */}
                {interview.meeting_link && (
                  <div className="mb-4">
                    <p className="text-muted-foreground text-sm mb-1">Meeting Link</p>
                    <a
                      href={interview.meeting_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary font-medium hover:underline text-sm"
                    >
                      {interview.meeting_link}
                    </a>
                  </div>
                )}

                {/* Interviewers */}
                {interview.interviewer_ids && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <User className="w-4 h-4" />
                    <span>Interviewers: {interview.interviewer_ids}</span>
                  </div>
                )}

                {/* Remarks */}
                {interview.remarks && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-muted-foreground text-sm mb-1">Remarks</p>
                    <p className="text-foreground text-sm">{interview.remarks}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
