import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Users, FileText, Eye, TrendingUp, CheckCircle, Clock, AlertCircle, ArrowUpRight, Calendar, Activity } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import axiosInstance from '../utils/axios';
import './Home.css';

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
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
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
      title: 'Create New Post',
      description: 'Write and publish a new blog post',
      icon: <FileText className="w-5 h-5" />,
      href: '/admin/create-blog',
      color: 'from-[#064540] to-[#2A8E9D]',
    },
    {
      title: 'View Registrations',
      description: 'Manage user registrations',
      icon: <Users className="w-5 h-5" />,
      href: '/admin/registrations',
      color: 'from-[#2A8E9D] to-[#064540]',
    },
    {
      title: 'Manage Content',
      description: 'Edit existing blog posts',
      icon: <Eye className="w-5 h-5" />,
      href: '/admin/manage-blog',
      color: 'from-[#064540] to-[#2A8E9D]',
    },
  ];

  const StatCard = ({ icon: Icon, title, value, trend, color = 'default' }) => {
    const colorStyles = {
      primary: 'from-[#064540] to-[#2A8E9D]',
      secondary: 'from-[#2A8E9D] to-[#064540]',
      accent: 'from-[#FECB0A] to-[#FCD34D]',
      default: 'from-gray-600 to-gray-800'
    };

    return (
      <div className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#064540]/5 to-[#2A8E9D]/5 rounded-2xl blur-xl group-hover:opacity-70 transition-all duration-500"></div>
        <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group-hover:shadow-lg group-hover:border-[#064540]/10 transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${colorStyles[color]} shadow-md`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg text-xs font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              <span>{trend}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#064540] border-t-transparent rounded-full animate-spin"></div>
              ) : (
                value
              )}
            </div>
            <div className="text-gray-600 font-medium text-sm">{title}</div>
          </div>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50/50">
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        toastClassName="rounded-xl shadow-lg"
      />
      
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-[#064540] via-[#2A8E9D] to-[#064540] rounded-3xl p-8 shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-black/5"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FECB0A]/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-2 h-2 bg-[#FECB0A] rounded-full animate-pulse"></div>
                  <span className="text-white/80 text-sm font-medium">Dashboard Overview</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
                  Welcome Back, Admin
                </h1>
                <p className="text-white/80 max-w-lg">
                  Monitor your platform's performance, manage content, and engage with your community from this central hub.
                </p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 min-w-[200px]">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-4 h-4 text-[#FECB0A]" />
                  <span className="text-[#FECB0A] text-sm font-semibold">
                    {currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="text-white text-2xl font-mono font-bold">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={Users} 
            title="Total Users" 
            value={stats.totalUsers.toLocaleString()} 
            trend="+12.5%"
            color="primary"
          />
          <StatCard 
            icon={FileText} 
            title="Total Posts" 
            value={stats.totalPosts.toLocaleString()} 
            trend="+8.2%"
            color="secondary"
          />
          <StatCard 
            icon={Eye} 
            title="Total Views" 
            value={stats.totalViews.toLocaleString()} 
            trend="+24.1%"
            color="accent"
          />
          <StatCard 
            icon={TrendingUp} 
            title="Active Users" 
            value={stats.activeUsers.toLocaleString()} 
            trend="+5.3%"
            color="primary"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-[#FECB0A] rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-[#064540]" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <NavLink
                key={index}
                to={action.href}
                className="group relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#064540]/20 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#064540]/5 to-[#2A8E9D]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FECB0A]/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} shadow-lg mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {action.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#064540] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {action.description}
                  </p>
                  <div className="flex items-center text-[#064540] font-semibold group-hover:translate-x-1 transition-transform duration-300">
                    <span>Get Started</span>
                    <ArrowUpRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </NavLink>
            ))}
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Post Status */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-[#064540] rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Content Status</h2>
              </div>
            </div>
            
            <div className="space-y-4">
              {[
                { 
                  title: 'Published Posts', 
                  value: stats.publishedPosts, 
                  icon: CheckCircle, 
                  color: 'text-emerald-600',
                  bgColor: 'bg-emerald-50',
                  description: 'Live and visible to users'
                },
                { 
                  title: 'Draft Posts', 
                  value: stats.draftPosts, 
                  icon: Clock, 
                  color: 'text-amber-600',
                  bgColor: 'bg-amber-50',
                  description: 'Saved but not published'
                },
                { 
                  title: 'Scheduled Posts', 
                  value: stats.scheduledPosts, 
                  icon: Calendar, 
                  color: 'text-blue-600',
                  bgColor: 'bg-blue-50',
                  description: 'Queued for future release'
                },
              ].map((status, index) => (
                <div key={index} className="flex items-center p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  <div className={`${status.bgColor} p-3 rounded-xl mr-4`}>
                    <status.icon className={`w-5 h-5 ${status.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{status.title}</h3>
                      <span className="text-2xl font-bold text-gray-900">
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-[#064540] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          status.value
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{status.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-[#2A8E9D] rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              </div>
              <button className="bg-gradient-to-r from-[#064540] to-[#2A8E9D] hover:from-[#2A8E9D] hover:to-[#064540] text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover:scale-105 shadow-md">
                View All
              </button>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[#064540] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Activity className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No recent activities</p>
                </div>
              ) : (
                activities.map((activity, index) => (
                  <div key={index} className="flex items-start p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                    <div className="bg-[#064540] p-2 rounded-lg mr-3 flex-shrink-0">
                      {activity.type === 'user' ? (
                        <Users className="w-4 h-4 text-white" />
                      ) : activity.type === 'blog' ? (
                        <FileText className="w-4 h-4 text-white" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{activity.action}</h4>
                      <p className="text-sm text-gray-600 truncate">{activity.user}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;