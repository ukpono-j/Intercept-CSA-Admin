import { useState, useEffect } from 'react';
import { FileTextIcon, ClockIcon, UsersIcon, XIcon, CheckIcon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../utils/axios';
import colors from '../utils/colors';

const ShowReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const REPORTS_PER_PAGE = 10;
  const MIN_REPORTS_FOR_PAGINATION = 20;
  const [stats, setStats] = useState({
    totalReports: 0,
    anonymousReports: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    fetchReports();
  }, []);

  // Handle body scroll when modal is open/closed
  useEffect(() => {
    if (selectedReport) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedReport]);

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

  const markReportAsRead = async (reportId) => {
    try {
      const response = await axiosInstance.patch(`/reports/${reportId}/read`);
      setReports(reports.map(report =>
        report._id === reportId ? { ...report, isRead: true } : report
      ));
    } catch (error) {
      toast.error('Failed to mark report as read');
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
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-10 rounded-2xl blur-xl group-2-hover:opacity-20 transition-opacity duration-300`}></div>
      <div
        className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-lg border border-[var(--border-light)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in"
        style={{ background: 'var(--card-bg)' }}
      >
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className={`text-xl sm:text-2xl bg-gradient-to-r ${color} p-2 sm:p-3 rounded-xl shadow-md`}>
            <Icon size={18} sm:size={20} style={{ color: 'var(--text-white)' }} />
          </div>
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          {isLoading ? (
            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
          ) : (
            value
          )}
        </div>
        <div className="text-xs sm:text-sm font-medium text-left" style={{ color: 'var(--text-secondary)' }}>
          {title}
        </div>
      </div>
    </div>
  );

  const handleReportClick = (report) => {
    setSelectedReport(report);
    if (!report.isRead) {
      markReportAsRead(report._id);
    }
  };

  const closeModal = () => {
    setSelectedReport(null);
  };

  // Pagination logic
  const isPaginationEnabled = reports.length >= MIN_REPORTS_FOR_PAGINATION;
  const totalPages = isPaginationEnabled ? Math.ceil(reports.length / REPORTS_PER_PAGE) : 1;
  const startIndex = isPaginationEnabled ? (currentPage - 1) * REPORTS_PER_PAGE : 0;
  const endIndex = isPaginationEnabled ? startIndex + REPORTS_PER_PAGE : reports.length;
  const paginatedReports = reports.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (!isPaginationEnabled) return;
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Show current page ±2
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          disabled={!isPaginationEnabled}
          className={`px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${currentPage === i && isPaginationEnabled
            ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-white shadow-md'
            : 'bg-white/80 hover:bg-orange-100 text-[var(--text-primary)]'
            } ${!isPaginationEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          style={{ border: '1px solid var(--border-light)' }}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="h-auto overflow-auto bg-gradient-to-br from-slate-50 via-orange-50/20 to-rose-50/20 p-3 sm:p-6 md:p-8">
      <ToastContainer />
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-xl mb-4 sm:mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-rose-400/10 to-purple-400/10"></div>
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-orange-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-rose-400/5 rounded-full blur-3xl"></div>

        <div className="relative z-10 p-3 sm:p-8 md:p-12 text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 bg-clip-text text-transparent mb-3 sm:mb-4">
            Reports Dashboard
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 font-light max-w-md sm:max-w-lg md:max-w-2xl leading-relaxed">
            View and manage all submitted reports in one place. Monitor report statistics and take appropriate actions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-8">
        <StatCard
          icon={FileTextIcon}
          title="Total Reports"
          value={stats.totalReports}
          color="from-orange-400 to-amber-400"
        />
        <StatCard
          icon={UsersIcon}
          title="Anonymous Reports"
          value={stats.anonymousReports}
          color="from-rose-400 to-pink-400"
        />
        <StatCard
          icon={ClockIcon}
          title="Pending Reports"
          value={stats.pendingReports}
          color="from-purple-400 to-indigo-400"
        />
      </div>

      <div
        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-[var(--border-light)] p-3 sm:p-6 md:p-8"
        style={{ background: 'var(--card-bg)' }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 sm:mb-6 md:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-left" style={{ color: 'var(--text-primary)' }}>
            Recent Reports
          </h2>
          <button
            className="mt-2 sm:mt-0 bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            onClick={fetchReports}
          >
            Refresh
          </button>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {isLoading ? (
            <div className="text-center py-4 sm:py-6">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : paginatedReports.length === 0 ? (
            <div className="text-left sm:text-center py-4 sm:py-6" style={{ color: 'var(--text-secondary)' }}>
              No reports available
            </div>
          ) : (
            paginatedReports.map((report, index) => (
              <div
                key={`${report._id || index}-${currentPage}`}
                className={`flex items-center p-3 sm:p-4 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-rose-50/50 transition-all duration-300 group cursor-pointer animate-fade-in ${!report.isRead ? 'font-bold bg-orange-50/20' : ''
                  }`}
                onClick={() => handleReportClick(report)}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 ${report.isAnonymous
                    ? 'bg-gradient-to-r from-rose-400 to-pink-400'
                    : 'bg-gradient-to-r from-orange-400 to-amber-400'
                    } text-white shadow-md group-hover:scale-105 transition-transform duration-300`}
                >
                  {report.isAnonymous ? <UsersIcon size={16} sm:size={18} /> : <FileTextIcon size={16} sm:size={18} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`font-semibold text-sm sm:text-base group-hover:text-orange-500 transition-colors duration-300 ${!report.isRead ? 'font-bold' : ''}`} style={{ color: 'var(--text-primary)' }}>
                      {report.isAnonymous ? 'Anonymous Report' : `Report by ${report.name || 'Unknown'}`}
                    </span>
                    {report.isRead && (
                      <CheckIcon size={14} sm:size={16} className="ml-2 text-green-500" />
                    )}
                  </div>
                  <div className="text-xs sm:text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {report.message.substring(0, 100)}...
                  </div>
                </div>
                <div className="text-xs sm:text-sm font-medium text-right" style={{ color: 'var(--text-secondary)' }}>
                  {formatTimeAgo(report.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
        {/* Pagination Controls */}
        <div className="mt-3 sm:mt-6 flex  sm:flex-row items-center justify-center gap-2 sm:gap-3">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || !isPaginationEnabled}
            className="px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 hover:bg-orange-100"
            style={{ border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
          >
            Previous
          </button>
          <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
            {renderPageNumbers()}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || !isPaginationEnabled}
            className="px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white/80 hover:bg-orange-100"
            style={{ border: '1px solid var(--border-light)', color: 'var(--text-primary)' }}
          >
            Next
          </button>
        </div>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full relative border-0 animate-slide-in overflow-hidden">
            {/* Header with gradient background */}
            <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 px-6 py-5 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400/10 via-rose-400/10 to-purple-400/10"></div>
              <button
                className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-300"
                onClick={closeModal}
              >
                <XIcon size={20} />
              </button>
              <div className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-3 rounded-xl ${selectedReport.isAnonymous
                      ? 'bg-gradient-to-r from-rose-400 to-pink-400'
                      : 'bg-gradient-to-r from-orange-400 to-amber-400'
                    } text-white shadow-lg`}>
                    {selectedReport.isAnonymous ? <UsersIcon size={20} /> : <FileTextIcon size={20} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {selectedReport.isAnonymous ? 'Anonymous Report' : `Report Details`}
                    </h3>
                    {!selectedReport.isAnonymous && selectedReport.name && (
                      <p className="text-slate-300 text-sm">Submitted by {selectedReport.name}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Date */}
              <div className="flex items-center justify-end">
                <span className="text-sm text-slate-500">
                  {formatFullDate(selectedReport.createdAt)}
                </span>
              </div>

              {/* Message Section */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-5 border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-amber-400 rounded-full"></div>
                  <h4 className="font-semibold text-slate-700">Report Message</h4>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {selectedReport.message}
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              {!selectedReport.isAnonymous && selectedReport.email && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-full"></div>
                    <h4 className="font-semibold text-slate-700">Contact Information</h4>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-blue-200 shadow-sm">
                    <p className="text-slate-600 text-sm font-medium mb-1">Email Address</p>
                    <p className="text-slate-800">{selectedReport.email}</p>
                  </div>
                </div>
              )}

              {/* Report Type Badge */}
              <div className="flex items-center justify-center">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${selectedReport.isAnonymous
                    ? 'bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200'
                    : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200'
                  }`}>
                  {selectedReport.isAnonymous ? (
                    <>
                      <UsersIcon size={16} className="mr-2" />
                      Anonymous Submission
                    </>
                  ) : (
                    <>
                      <FileTextIcon size={16} className="mr-2" />
                      Identified Submission
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-200">
              <button
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors duration-200"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="bg-gradient-to-r from-orange-400 to-amber-400 hover:from-orange-500 hover:to-amber-500 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
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