// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import Home from './pages/Home';
import CreateBlog from './pages/CreateBlog';
import ManageBlog from './pages/ManageBlog';
import Registrations from './pages/Registrations';
import Login from './pages/Login';
import Layout from './components/Layout';
import colors from './utils/colors';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';
import { Component } from 'react';
import ShowReports from './pages/ShowReports';
import PodcastAdmin from './pages/PodcastAdmin';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    console.error('ErrorBoundary caught an error:', error, error.stack);
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600">Something went wrong</h2>
          <p className="text-sm text-gray-600">{this.state.error?.message || 'Unknown error'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-4 px-4 py-2 rounded-lg bg-gray-200 text-gray-800"
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // console.log('ProtectedRoute: Token present?', !!token);
  return token ? children : <Navigate to="/login" />;
};

const App = () => {
  colors.applyTheme();
  // console.log('App component rendered');

  return (
    <Router>
      <ToastContainer />
      <ErrorBoundary>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="create-blog" element={<CreateBlog />} />
            <Route path="manage-blog" element={<ManageBlog />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="show-reports" element={<ShowReports />} />
            <Route path="podcasts" element={<PodcastAdmin />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;