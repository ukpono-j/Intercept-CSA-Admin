import { useState, useEffect } from 'react';
import { FileText, Clock, Users, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../utils/axios';
import colors from '../utils/colors';

const ShowReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [stats, setStats] = useState({
    totalReports: 0,
    anonymousReports: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get('/reports');
      const reportsData = response.data;
      
      setStats({
        totalReports: reportsData.length,
        anonymousReports: reportsData.filter(report => report.isAnonymous).length,
        pendingReports: reportsData.filter(report => report.status === 'pending').length,
      });
      
      setReports(reportsData);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString();
  };

  const formatFullDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="relative group-2">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-20 rounded-2xl blur-xl group-2-hover:opacity-30 transition-opacity duration-300`}></div>
      <div
        className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-[var(--border-light)] hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        style={{ background: 'var(--card-bg)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`text-3xl bg-gradient-to-r ${color} p-3 rounded-xl shadow-lg`}>
            <Icon size={24} style={{ color: 'var(--text-white)' }} />
          </div>
        </div>
        <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            value
          )}
        </div>
        <div className="text-slate-600 font-medium">{title}</div>
      </div>
    </div>
  );

  const handleReportClick = (report) => {
    setSelectedReport(report);
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-rose-50/30 p-8">
      <ToastContainer />
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-rose-500/20 to-purple-500/20 animate-pulse"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 p-12">
          <h1 className="text-6xl font-black bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Reports Dashboard
          </h1>
          <p className="text-xl text-slate-300 font-light max-w-2xl leading-relaxed">
            View and manage all submitted reports in one place. Monitor report statistics and take appropriate actions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={FileText}
          title="Total Reports"
          value={stats.totalReports}
          color="from-orange-500 to-amber-500"
        />
        <StatCard
          icon={Users}
          title="Anonymous Reports"
          value={stats.anonymousReports}
          color="from-rose-500 to-pink-500"
        />
        <StatCard
          icon={Clock}
          title="Pending Reports"
          value={stats.pendingReports}
          color="from-purple-500 to-indigo-500"
        />
      </div>

      <div
        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-[var(--border-light)] p-8"
        style={{ background: 'var(--card-bg)' }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Recent Reports
          </h2>
          <button
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            onClick={fetchReports}
          >
            Refresh
          </button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              No reports available
            </div>
          ) : (
            reports.map((report, index) => (
              <div
                key={index}
                className="flex items-center p-4 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-rose-50 transition-all duration-300 group cursor-pointer"
                onClick={() => handleReportClick(report)}
              >
                <div
                  className={`p-3 rounded-xl mr-4 ${
                    report.isAnonymous 
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500' 
                      : 'bg-gradient-to-r from-orange-500 to-amber-500'
                  } text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {report.isAnonymous ? <Users size={20} /> : <FileText size={20} />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold group-hover:text-orange-600 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                    {report.isAnonymous ? 'Anonymous Report' : `Report by ${report.name || 'Unknown'}`}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {report.message.substring(0, 100)}...
                  </div>
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {formatTimeAgo(report.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl max-w-2xl w-full p-8 relative border border-[var(--border-light)]">
            <button
              className="absolute top-4 right-4 text-slate-600 hover:text-orange-600 transition-colors duration-300"
              onClick={closeModal}
            >
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
              {selectedReport.isAnonymous ? 'Anonymous Report' : `Report by ${selectedReport.name || 'Unknown'}`}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-600">Message</p>
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                  {selectedReport.message}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Status</p>
                <p className="text-base capitalize" style={{ color: 'var(--text-secondary)' }}>
                  {selectedReport.status}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-600">Submitted</p>
                <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                  {formatFullDate(selectedReport.createdAt)}
                </p>
              </div>
              {!selectedReport.isAnonymous && selectedReport.email && (
                <div>
                  <p className="text-sm font-semibold text-slate-600">Email</p>
                  <p className="text-base" style={{ color: 'var(--text-secondary)' }}>
                    {selectedReport.email}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-8 flex justify-end">
              <button
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowReports;