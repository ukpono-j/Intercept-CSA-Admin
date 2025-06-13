import { useState, useEffect } from 'react';
import { Users, FileText, Eye, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../utils/axios';
import colors from '../utils/colors';

const Home = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalViews: 0,
    publishedPosts: 0,
    draftPosts: 0,
    scheduledPosts: 0,
    activeUsers: 0,
  });
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchStats();
    fetchActivities();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [usersResponse, blogsResponse] = await Promise.all([
        axiosInstance.get('/users'),
        axiosInstance.get('/blogs'),
      ]);

      const users = usersResponse.data;
      const blogs = blogsResponse.data;

      const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
      const publishedPosts = blogs.filter((blog) => blog.status === 'published').length;
      const draftPosts = blogs.filter((blog) => blog.status === 'draft').length;
      const scheduledPosts = blogs.filter((blog) => blog.status === 'scheduled').length;
      const activeUsers = users.filter((user) => user.status === 'active').length;

      setStats({
        totalUsers: users.length,
        totalPosts: blogs.length,
        totalViews,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        activeUsers,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      const response = await axiosInstance.get('/activities');
      setActivities(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch recent activities');
    }
  };

  const quickActions = [
    {
      title: "Create New Post",
      description: "Write and publish a new blog post",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      gradient: "from-orange-500 to-amber-500",
      href: "/admin/create-blog"
    },
    {
      title: "View Registrations",
      description: "Manage user registrations",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      gradient: "from-rose-500 to-pink-500",
      href: "/admin/registrations"
    },
    {
      title: "Manage Content",
      description: "Edit existing blog posts",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      gradient: "from-purple-500 to-indigo-500",
      href: "/admin/manage-blog"
    }
  ];

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-r ${color} opacity-20 rounded-2xl blur-xl group-hover:opacity-30 transition-opacity duration-300`}></div>
      <div
        className="relative bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-[var(--border-light)] hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
        style={{ background: 'var(--card-bg)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`text-3xl bg-gradient-to-r ${color} p-3 rounded-xl shadow-lg`}>
            <Icon size={24} style={{ color: 'var(--text-white)' }} />
          </div>
          <div className={`text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r ${color} text-white shadow-md`}>
            {title === "Total Users" ? "+12%" :
              title === "Total Posts" ? "+5%" :
                title === "Total Views" ? "+28%" : "+3.2%"}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-rose-50/30 p-8">
      <ToastContainer />
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl mb-8">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-rose-500/20 to-purple-500/20 animate-pulse"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6 animate-fade-in">
            <div className="text-left max-w-full md:max-w-lg">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 bg-clip-text text-transparent mb-3 tracking-tight">
                Welcome Back
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-slate-300 font-light leading-relaxed">
                Your dashboard is ready. Manage content, track performance, and engage with your community all in one beautiful interface.
              </p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-orange-400 text-sm sm:text-base md:text-lg font-semibold">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="text-slate-300 text-lg sm:text-xl md:text-2xl lg:text-3xl font-mono mt-1">
                {currentTime.toLocaleTimeString('en-US', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats.totalUsers}
          color="from-orange-500 to-amber-500"
        />
        <StatCard
          icon={FileText}
          title="Total Posts"
          value={stats.totalPosts}
          color="from-rose-500 to-pink-500"
        />
        <StatCard
          icon={Eye}
          title="Total Views"
          value={stats.totalViews.toLocaleString()}
          color="from-purple-500 to-indigo-500"
        />
        <StatCard
          icon={TrendingUp}
          title="Active Users"
          value={stats.activeUsers}
          color="from-emerald-500 to-teal-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {quickActions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className="group relative overflow-hidden bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-[var(--border-light)] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            style={{ background: 'var(--card-bg)' }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
            <div className="relative p-8">
              <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${action.gradient} text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-orange-600 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                {action.title}
              </h3>
              <p className="text-slate-600 leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
                {action.description}
              </p>
              <div className="flex items-center text-orange-600 font-semibold group-hover:text-orange-700 transition-colors duration-300">
                <span>Get Started</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
            <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-orange-300/50 transition-colors duration-500"></div>
          </a>
        ))}
      </div>

      <div
        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-[var(--border-light)] p-8 mb-8"
        style={{ background: 'var(--card-bg)' }}
      >
        <h2 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
          Post Status
        </h2>
        <div className="space-y-4">
          {[
            { action: "Published Posts", value: stats.publishedPosts, type: "published", icon: <CheckCircle size={20} /> },
            { action: "Draft Posts", value: stats.draftPosts, type: "draft", icon: <Clock size={20} /> },
            { action: "Scheduled Posts", value: stats.scheduledPosts, type: "scheduled", icon: <AlertCircle size={20} /> }
          ].map((status, index) => (
            <div
              key={index}
              className="flex items-center p-4 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-rose-50 transition-all duration-300 group"
            >
              <div
                className={`p-3 rounded-xl mr-4 ${status.type === 'published' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                  status.type === 'draft' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                    'bg-gradient-to-r from-purple-500 to-indigo-500'
                  } text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {status.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold group-hover:text-orange-600 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                  {status.action}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {isLoading ? '...' : status.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-[var(--border-light)] p-8"
        style={{ background: 'var(--card-bg)' }}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Recent Activity
          </h2>
          <button
            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            View All
          </button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-4">
              <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              No recent activities
            </div>
          ) : (
            activities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center p-4 rounded-2xl hover:bg-gradient-to-r hover:from-orange-50 hover:to-rose-50 transition-all duration-300 group"
              >
                <div
                  className={`p-3 rounded-xl mr-4 ${activity.type === 'user' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                    activity.type === 'blog' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                      'bg-gradient-to-r from-purple-500 to-indigo-500'
                    } text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  {activity.type === 'user' ? <Users size={20} /> :
                    activity.type === 'blog' ? <FileText size={20} /> :
                      <AlertCircle size={20} />}
                </div>
                <div className="flex-1">
                  <div className="font-semibold group-hover:text-orange-600 transition-colors duration-300" style={{ color: 'var(--text-primary)' }}>
                    {activity.action}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {activity.user}
                  </div>
                </div>
                <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  {formatTimeAgo(activity.createdAt)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;