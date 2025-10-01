import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Clock, Users, X, Check, Search, Download, TrendingUp } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../utils/axios';
import 'react-toastify/dist/ReactToastify.css';

// Backend base URLs from environment variables
const API_BASE_URL = import.meta.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error('ShowReports ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <p className="text-sm text-gray-600">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 rounded-xl bg-gray-200 text-gray-800 hover:bg-gray-300 transition-all duration-200"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Reusable Modal Component (Aligned with ManageBlog)
const Modal = ({ isOpen, onClose, title, children, size = 'default' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    default: 'max-w-2xl',
    large: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden transform animate-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-slate-50 to-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Stats Card Component (Aligned with ManageBlog)
const StatsCard = ({ title, value, icon: Icon, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        {trend && (
          <p className={`text-sm mt-2 flex items-center gap-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            <TrendingUp size={14} />
            {trend > 0 ? '+' : ''}{trend}% this month
          </p>
        )}
      </div>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-r from-yellow-500 to-yellow-500">
        <Icon size={28} className="text-white" />
      </div>
    </div>
  </div>
);

const ShowReports = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const REPORTS_PER_PAGE = 10;
  const [stats, setStats] = useState({
    totalReports: 0,
    anonymousReports: 0,
    pendingReports: 0,
  });

  // Debounced fetchReports
  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/reports', {
        params: { search: searchTerm },
      });
      const reportsData = Array.isArray(response.data) ? response.data : [];
      setReports(reportsData);
      setStats({
        totalReports: reportsData.length,
        anonymousReports: reportsData.filter(report => report.isAnonymous).length,
        pendingReports: reportsData.filter(report => report.status === 'pending').length,
      });
    } catch (error) {
      console.error('Fetch reports error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      const errorMessage =
        error.response?.status === 408
          ? 'Request timed out while fetching reports. Please try again.'
          : error.response?.data?.message || 'Failed to fetch reports';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

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

  const markReportAsRead = async (reportId) => {
    try {
      await axiosInstance.patch(`/reports/${reportId}/read`);
      setReports(reports.map(report =>
        report._id === reportId ? { ...report, isRead: true } : report
      ));
      toast.success('Report marked as read');
    } catch (error) {
      console.error('Mark report as read error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to mark report as read');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Email', 'Message', 'Anonymous', 'Status', 'Created At'];
    const rows = reports.map((report) => [
      report._id || 'N/A',
      report.isAnonymous ? 'Anonymous' : report.name || 'Unknown',
      report.isAnonymous ? 'N/A' : report.email || 'N/A',
      `"${report.message?.replace(/"/g, '""') || ''}"`,
      report.isAnonymous ? 'Yes' : 'No',
      report.status || 'Unknown',
      new Date(report.createdAt).toLocaleString(),
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'reports.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'No date';
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatFullDate = (date) => {
    if (!date) return 'No date';
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

  // Pagination logic
  const totalPages = Math.ceil(reports.length / REPORTS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * REPORTS_PER_PAGE;
  const endIndex = startIndex + REPORTS_PER_PAGE;
  const paginatedReports = reports.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
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
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === i
            ? 'bg-gradient-to-r from-yellow-500 to-yellow-500 text-white shadow-md'
            : 'bg-white hover:bg-yellow-50 text-gray-900'
            } border border-gray-200`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  const SkeletonCard = () => (
    <div className="flex items-center p-4 rounded-2xl border border-gray-100 shadow-sm bg-white animate-pulse">
      <div className="w-12 h-12 bg-gray-200 rounded-xl mr-4"></div>
      <div className="flex-1">
        <div className="h-6 w-3/4 bg-gray-200 rounded mb-2"></div>
        <div className="h-4 w-full bg-gray-200 rounded"></div>
      </div>
      <div className="h-6 w-20 bg-gray-200 rounded ml-4"></div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <ToastContainer position="top-right" autoClose={3000} />
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Reports Dashboard</h1>
              <p className="text-lg text-gray-600 mt-2">View and manage all submitted reports</p>
            </div>
            <button
              onClick={fetchReports}
              className="bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Download size={20} />
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Total Reports"
              value={stats.totalReports}
              icon={FileText}
              trend={10}
            />
            <StatsCard
              title="Anonymous Reports"
              value={stats.anonymousReports}
              icon={Users}
              trend={5}
            />
            <StatsCard
              title="Pending Reports"
              value={stats.pendingReports}
              icon={Clock}
              trend={-2}
            />
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={exportToCSV}
                className="bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <Download size={16} />
                Export
              </button>
            </div>
          </div>
          {error ? (
            <div className="bg-white rounded-2xl p-16 text-center">
              <p className="text-lg text-red-600">{error}</p>
              <button
                onClick={fetchReports}
                className="mt-4 bg-gradient-to-r from-yellow-500 to-yellow-500 hover:from-yellow-600 hover:to-yellow-600 text-white px-6 py-3 rounded-xl transition-all duration-200"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))}
            </div>
          ) : paginatedReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <FileText size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600 mb-6">No reports are available at the moment</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedReports.map((report, index) => (
                  <div
                    key={`${report._id || index}-${currentPage}`}
                    className={`flex items-center p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md bg-white transition-all duration-300 group cursor-pointer ${!report.isRead ? 'bg-yellow-50/20' : ''}`}
                    onClick={() => {
                      setSelectedReport(report);
                      if (!report.isRead) markReportAsRead(report._id);
                    }}
                  >
                    <div
                      className={`p-3 rounded-xl mr-4 ${report.isAnonymous
                        ? 'bg-gradient-to-r from-rose-500 to-pink-500'
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-500'
                        } text-white shadow-md group-hover:scale-105 transition-transform duration-300`}
                    >
                      {report.isAnonymous ? <Users size={18} /> : <FileText size={18} />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center">
                        <span className={`font-semibold text-base group-hover:text-yellow-600 transition-colors duration-300 ${!report.isRead ? 'font-bold' : ''} text-gray-900`}>
                          {report.isAnonymous ? 'Anonymous Report' : `Report by ${report.name || 'Unknown'}`}
                        </span>
                        {report.isRead && (
                          <Check size={16} className="ml-2 text-green-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {report.message?.substring(0, 100) || 'No message'}...
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-600 text-right">
                      {formatTimeAgo(report.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl disabled:opacity-50 transition-all duration-200"
                  >
                    Previous
                  </button>
                  <div className="flex gap-2">
                    {renderPageNumbers()}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl disabled:opacity-50 transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
          <Modal isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} title="Report Details" size="default">
            {selectedReport && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-yellow-50 to-yellow-50 rounded-2xl border border-gray-100">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${selectedReport.isAnonymous ? 'bg-gradient-to-r from-rose-500 to-pink-500' : 'bg-gradient-to-r from-yellow-500 to-yellow-500'}`}>
                    {selectedReport.isAnonymous ? <Users size={24} /> : <FileText size={24} />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {selectedReport.isAnonymous ? 'Anonymous Report' : `Report by ${selectedReport.name || 'Unknown'}`}
                    </h3>
                    <p className="text-gray-600">{formatFullDate(selectedReport.createdAt)}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-700 mb-3">Report Message</h4>
                  <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                    <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {selectedReport.message || 'No message'}
                    </p>
                  </div>
                </div>
                {!selectedReport.isAnonymous && (selectedReport.name || selectedReport.email) && (
                  <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3">Contact Information</h4>
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm space-y-2">
                      {selectedReport.name && (
                        <>
                          <p className="text-sm text-gray-600 font-medium">Name</p>
                          <p className="text-gray-900">{selectedReport.name}</p>
                        </>
                      )}
                      {selectedReport.email && (
                        <>
                          <p className="text-sm text-gray-600 font-medium">Email Address</p>
                          <p className="text-gray-900">{selectedReport.email}</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-center">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${selectedReport.isAnonymous
                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                    : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                    }`}>
                    {selectedReport.isAnonymous ? (
                      <>
                        <Users size={16} className="mr-2" />
                        Anonymous Submission
                      </>
                    ) : (
                      <>
                        <FileText size={16} className="mr-2" />
                        Identified Submission
                      </>
                    )}
                  </span>
                </div>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ShowReports;