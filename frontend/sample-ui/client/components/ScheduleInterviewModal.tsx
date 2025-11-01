import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { X, AlertCircle } from 'lucide-react';
import { interviewsAPI } from '@/lib/api';

interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  applicationIds: number[];
}

const validationSchema = Yup.object({
  round_number: Yup.number().min(1, 'Round number must be at least 1').required('Round number is required'),
  round_type: Yup.string().required('Round type is required'),
  scheduled_date: Yup.string().required('Scheduled date is required'),
  duration_minutes: Yup.number().min(15, 'Duration must be at least 15 minutes').required('Duration is required'),
  interviewer_ids: Yup.string(),
  manager_id: Yup.number(),
  meeting_link: Yup.string().url('Invalid URL'),
  location: Yup.string().required('Location is required'),
  remarks: Yup.string(),
});

export default function ScheduleInterviewModal({
  isOpen,
  onClose,
  onSuccess,
  applicationIds,
}: ScheduleInterviewModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      round_number: 1,
      round_type: 'Technical',
      scheduled_date: '',
      duration_minutes: 60,
      interviewer_ids: '',
      manager_id: '',
      meeting_link: '',
      location: 'online',
      remarks: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        setError('');

        // Schedule interview for each selected application
        for (const applicationId of applicationIds) {
          await interviewsAPI.scheduleInterview({
            ...values,
            application_id: applicationId,
            schedule_status: 'scheduled',
          });
        }

        formik.resetForm();
        onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to schedule interview');
        console.error('Error scheduling interview:', err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card">
          <h2 className="text-2xl font-bold text-foreground">Schedule Interview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={formik.handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Scheduling interview for {applicationIds.length} applicant{applicationIds.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Round Number */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Round Number *
              </label>
              <input
                type="number"
                min="1"
                {...formik.getFieldProps('round_number')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formik.touched.round_number && formik.errors.round_number
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border focus:ring-primary'
                }`}
              />
              {formik.touched.round_number && formik.errors.round_number && (
                <p className="mt-1 text-sm text-destructive">{formik.errors.round_number}</p>
              )}
            </div>

            {/* Round Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Round Type *
              </label>
              <select
                {...formik.getFieldProps('round_type')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formik.touched.round_type && formik.errors.round_type
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border focus:ring-primary'
                }`}
              >
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Manager">Manager</option>
                <option value="Final">Final</option>
                <option value="Culture Fit">Culture Fit</option>
              </select>
              {formik.touched.round_type && formik.errors.round_type && (
                <p className="mt-1 text-sm text-destructive">{formik.errors.round_type}</p>
              )}
            </div>

            {/* Scheduled Date & Time */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Scheduled Date & Time *
              </label>
              <input
                type="datetime-local"
                {...formik.getFieldProps('scheduled_date')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formik.touched.scheduled_date && formik.errors.scheduled_date
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border focus:ring-primary'
                }`}
              />
              {formik.touched.scheduled_date && formik.errors.scheduled_date && (
                <p className="mt-1 text-sm text-destructive">{formik.errors.scheduled_date}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Duration (minutes) *
              </label>
              <input
                type="number"
                min="15"
                step="15"
                {...formik.getFieldProps('duration_minutes')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formik.touched.duration_minutes && formik.errors.duration_minutes
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border focus:ring-primary'
                }`}
              />
              {formik.touched.duration_minutes && formik.errors.duration_minutes && (
                <p className="mt-1 text-sm text-destructive">{formik.errors.duration_minutes}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location *
              </label>
              <select
                {...formik.getFieldProps('location')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formik.touched.location && formik.errors.location
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border focus:ring-primary'
                }`}
              >
                <option value="online">Online</option>
                <option value="office">Office</option>
                <option value="hybrid">Hybrid</option>
              </select>
              {formik.touched.location && formik.errors.location && (
                <p className="mt-1 text-sm text-destructive">{formik.errors.location}</p>
              )}
            </div>

            {/* Meeting Link */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Meeting Link
              </label>
              <input
                type="url"
                {...formik.getFieldProps('meeting_link')}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  formik.touched.meeting_link && formik.errors.meeting_link
                    ? 'border-destructive focus:ring-destructive'
                    : 'border-border focus:ring-primary'
                }`}
                placeholder="https://meet.example.com/meeting"
              />
              {formik.touched.meeting_link && formik.errors.meeting_link && (
                <p className="mt-1 text-sm text-destructive">{formik.errors.meeting_link}</p>
              )}
            </div>

            {/* Interviewer IDs */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Interviewer IDs (comma-separated)
              </label>
              <input
                type="text"
                {...formik.getFieldProps('interviewer_ids')}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="emp_001, emp_002"
              />
            </div>

            {/* Manager ID */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Manager ID
              </label>
              <input
                type="number"
                {...formik.getFieldProps('manager_id')}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Remarks
            </label>
            <textarea
              {...formik.getFieldProps('remarks')}
              rows={3}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Additional notes or instructions..."
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4 border-t border-border">
            <button
              type="submit"
              disabled={submitting || applicationIds.length === 0}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Scheduling...' : 'Schedule Interview'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-secondary text-secondary-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
