import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { toast } from 'react-toastify';
import {
  FaUsers,
  FaBriefcase,
  FaChartLine,
  FaPalette,
  FaFont,
  FaTshirt,
  FaSearch,
  FaFilter,
  FaLink,
  FaUserShield,
  FaTrashAlt,
  FaUserTimes,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import DeleteConfirmModal from './DeleteConfirmModal';
import LoadingSpinner from '../common/LoadingSpinner';
import './AdminDashboard.css';

interface StatItem {
  templateId?: string;
  color?: string;
  font?: string;
  radius?: string;
  count: number;
}

interface GrowthItem {
  date: string;
  count: number;
}

interface AdminStats {
  totalUsers: number;
  totalPortfolios: number;
  templateUsage: StatItem[];
  themeColorUsage: StatItem[];
  fontFamilyUsage: StatItem[];
  borderRadiusUsage: StatItem[];
  registrationsOverTime: GrowthItem[];
  portfoliosOverTime: GrowthItem[];
}

interface AggregatedUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  username?: string;
  createdAt: string;
  hasPortfolio: boolean;
  portfolioStats?: {
    templateId?: string;
    themeColor?: string;
    fontFamily?: string;
    projectsCount: number;
    skillsCount: number;
    educationCount: number;
    experienceCount: number;
    views: number;
    contactCount: number;
  };
}

const AdminDashboard: React.FC = () => {
  const { user: currentUser } = useAuth();

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview');

  // Stats / Overview State
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsError, setStatsError] = useState('');

  // User Directory State
  const [users, setUsers] = useState<AggregatedUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [portfolioFilter, setPortfolioFilter] = useState<'all' | 'has' | 'none'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    targetType: 'user' | 'portfolio';
    userId: string;
    userName: string;
    userEmail: string;
  }>({
    isOpen: false,
    targetType: 'user',
    userId: '',
    userName: '',
    userEmail: '',
  });

  // Fetch KPI Stats
  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/stats');
      setStats(response.data);
    } catch (err: any) {
      setStatsError(err.response?.data?.message || 'Failed to fetch admin stats');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch User Directory list
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const response = await api.get('/api/admin/users', {
        params: { search: searchQuery },
      });
      setUsers(response.data);
    } catch (err: any) {
      setUsersError(err.response?.data?.message || 'Failed to load user directory');
    } finally {
      setUsersLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  // Handle promoting or demoting roles
  const handleToggleRole = async (userId: string, currentRole: string) => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/api/admin/users/${userId}/role`, { role: targetRole });
      toast.success(`User role successfully changed to ${targetRole}`);
      fetchUsers(); // reload list
      fetchStats(); // refresh counters
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not update user role');
    }
  };

  // Delete modal triggers
  const openDeleteModal = (targetType: 'user' | 'portfolio', userItem: AggregatedUser) => {
    setDeleteModal({
      isOpen: true,
      targetType,
      userId: userItem._id,
      userName: userItem.name,
      userEmail: userItem.email,
    });
  };

  const handleConfirmDelete = async () => {
    const { targetType, userId } = deleteModal;
    if (targetType === 'user') {
      await api.delete(`/api/admin/users/${userId}`);
      toast.success('User account and portfolio permanently deleted.');
    } else {
      await api.delete(`/api/admin/users/${userId}/portfolio`);
      toast.success('Portfolio permanently deleted.');
    }
    fetchUsers();
    fetchStats();
  };

  // Perform query lookup
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  // Filter local results based on drop down filters
  const filteredUsers = users.filter((u) => {
    const matchesPortfolio =
      portfolioFilter === 'all' ||
      (portfolioFilter === 'has' && u.hasPortfolio) ||
      (portfolioFilter === 'none' && !u.hasPortfolio);

    const matchesRole =
      roleFilter === 'all' || u.role === roleFilter;

    return matchesPortfolio && matchesRole;
  });

  if (loading) {
    return <LoadingSpinner fullPage message="Initializing Admin command center..." />;
  }

  if (statsError || !stats) {
    return (
      <div className="admin-error-container">
        <h3>Console Fetch Error</h3>
        <p>{statsError || 'Invalid credentials or database connection.'}</p>
      </div>
    );
  }

  const conversionRate = stats.totalUsers > 0
    ? ((stats.totalPortfolios / stats.totalUsers) * 100).toFixed(1)
    : '0.0';

  const maxTemplateCount = Math.max(...stats.templateUsage.map(t => t.count), 1);
  const maxColorCount = Math.max(...stats.themeColorUsage.map(c => c.count), 1);
  const maxFontCount = Math.max(...stats.fontFamilyUsage.map(f => f.count), 1);
  const maxTimelineCount = Math.max(
    ...stats.registrationsOverTime.map(d => d.count),
    ...stats.portfoliosOverTime.map(d => d.count),
    1
  );

  return (
    <div className="admin-dashboard-wrapper">
      <div className="admin-dashboard-container">
        <header className="admin-header">
          <h1>Admin Command Center</h1>
          <p className="admin-subtitle">Monitor registrations metrics, customize roles, and track template adoption.</p>
        </header>

        {/* TAB CONTROLS */}
        <div className="admin-tab-nav glass-card">
          <button
            className={`tab-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview Charts
          </button>
          <button
            className={`tab-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            User Directory Table
          </button>
        </div>

        {/* ==================== TAB 1: OVERVIEW CHARTS ==================== */}
        {activeTab === 'overview' && (
          <div className="tab-fade-in">
            {/* KPI METRIC CARDS */}
            <div className="admin-kpi-grid">
              <div className="kpi-card glass-card purple-glow">
                <div className="kpi-icon-wrapper">
                  <FaUsers />
                </div>
                <div className="kpi-details">
                  <h3>Total Registered Users</h3>
                  <p className="kpi-value">{stats.totalUsers}</p>
                  <span className="kpi-trend">All-time registrations</span>
                </div>
              </div>

              <div className="kpi-card glass-card emerald-glow">
                <div className="kpi-icon-wrapper">
                  <FaBriefcase />
                </div>
                <div className="kpi-details">
                  <h3>Portfolios Created</h3>
                  <p className="kpi-value">{stats.totalPortfolios}</p>
                  <span className="kpi-trend">Active custom designs</span>
                </div>
              </div>

              <div className="kpi-card glass-card amber-glow">
                <div className="kpi-icon-wrapper">
                  <FaChartLine />
                </div>
                <div className="kpi-details">
                  <h3>Conversion Rate</h3>
                  <p className="kpi-value">{conversionRate}%</p>
                  <span className="kpi-trend">Portfolios per user ratio</span>
                </div>
              </div>
            </div>

            {/* GROWTH TIMELINE */}
            <div className="admin-section glass-card timeline-card">
              <div className="section-title-row">
                <h2>User & Portfolio Growth (Last 30 Days)</h2>
                <div className="timeline-legend">
                  <span className="legend-item user-legend">Users</span>
                  <span className="legend-item portfolio-legend">Portfolios</span>
                </div>
              </div>

              {stats.registrationsOverTime.length === 0 && stats.portfoliosOverTime.length === 0 ? (
                <p className="empty-chart-msg">No growth records found in the last 30 days.</p>
              ) : (
                <div className="chart-bar-container">
                  <div className="chart-grid-lines">
                    {[1, 2, 3, 4].map(line => (
                      <div key={line} className="grid-line" style={{ bottom: `${line * 25}%` }} />
                    ))}
                  </div>
                  <div className="chart-bars-scroll">
                    <div className="chart-bars-flex">
                      {Array.from(
                        new Set([
                          ...stats.registrationsOverTime.map(d => d.date),
                          ...stats.portfoliosOverTime.map(d => d.date)
                        ])
                      )
                        .sort()
                        .map(date => {
                          const userReg = stats.registrationsOverTime.find(d => d.date === date)?.count || 0;
                          const portCre = stats.portfoliosOverTime.find(d => d.date === date)?.count || 0;

                          return (
                            <div key={date} className="chart-column">
                              <div className="column-bar-pair">
                                <div
                                  className="grow-bar user-bar"
                                  style={{ height: `${(userReg / maxTimelineCount) * 100}%` }}
                                  title={`${userReg} registrations on ${date}`}
                                />
                                <div
                                  className="grow-bar portfolio-bar"
                                  style={{ height: `${(portCre / maxTimelineCount) * 100}%` }}
                                  title={`${portCre} creations on ${date}`}
                                />
                              </div>
                              <span className="column-date-label">
                                {new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TEMPLATE AND STYLE DISTRIBUTIONS */}
            <div className="admin-distributions-grid">
              <div className="admin-section glass-card">
                <h2><FaTshirt /> Template Popularity</h2>
                <div className="progress-distribution-list">
                  {stats.templateUsage.length === 0 ? (
                    <p className="empty-chart-msg">No templates selected yet.</p>
                  ) : (
                    stats.templateUsage.map(t => {
                      const percentage = ((t.count / maxTemplateCount) * 100).toFixed(0);
                      return (
                        <div key={t.templateId} className="distribution-row">
                          <div className="distribution-label">
                            <span className="template-name">{t.templateId}</span>
                            <span className="template-count">{t.count} used</span>
                          </div>
                          <div className="progress-bar-track">
                            <div
                              className={`progress-bar-fill fill-${t.templateId}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="style-stats-subgrid">
                <div className="admin-section glass-card style-section">
                  <h2><FaPalette /> Accent Choices</h2>
                  <div className="circle-badges-grid">
                    {stats.themeColorUsage.length === 0 ? (
                      <p className="empty-chart-msg">No colors chosen yet.</p>
                    ) : (
                      stats.themeColorUsage.map(c => {
                        const weight = ((c.count / maxColorCount) * 1.5 + 0.5).toFixed(2);
                        return (
                          <div key={c.color} className="color-badge-card" style={{ transform: `scale(${weight})` }}>
                            <span className={`color-dot dot-${c.color}`} />
                            <span className="style-stat-label">{c.color} ({c.count})</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="admin-section glass-card style-section">
                  <h2><FaFont /> Font Distributions</h2>
                  <div className="font-distribution-list">
                    {stats.fontFamilyUsage.length === 0 ? (
                      <p className="empty-chart-msg">No custom fonts selected yet.</p>
                    ) : (
                      stats.fontFamilyUsage.map(f => {
                        const pct = ((f.count / maxFontCount) * 100).toFixed(0);
                        return (
                          <div key={f.font} className="font-stat-bar">
                            <div className="font-meta">
                              <span className={`font-preview font-${f.font}`}>{f.font}</span>
                              <span>{f.count}</span>
                            </div>
                            <div className="font-bar-track">
                              <div className="font-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: USER DIRECTORY ==================== */}
        {activeTab === 'users' && (
          <div className="tab-fade-in">
            {/* DIRECTORY FILTERS */}
            <div className="directory-controls glass-card">
              <form onSubmit={handleSearchSubmit} className="search-form-row">
                <div className="search-input-wrapper">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name, email, or username…"
                  />
                </div>
                <button type="submit" className="btn-admin-search">Query</button>
              </form>

              <div className="filters-row">
                <div className="filter-group">
                  <FaFilter className="filter-icon" />
                  <select
                    value={portfolioFilter}
                    onChange={(e) => setPortfolioFilter(e.target.value as any)}
                  >
                    <option value="all">All Portfolios</option>
                    <option value="has">Has Portfolio</option>
                    <option value="none">No Portfolio</option>
                  </select>
                </div>

                <div className="filter-group">
                  <FaUserShield className="filter-icon" />
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)}
                  >
                    <option value="all">All Roles</option>
                    <option value="admin">Admins Only</option>
                    <option value="user">Users Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DIRECTORY DATA TABLE */}
            <div className="admin-section table-section glass-card">
              {usersLoading ? (
                <LoadingSpinner message="Loading database directory records..." />
              ) : usersError ? (
                <p className="table-error">{usersError}</p>
              ) : filteredUsers.length === 0 ? (
                <p className="table-empty">No users match your criteria.</p>
              ) : (
                <div className="admin-table-scroll">
                  <table className="admin-data-table">
                    <thead>
                      <tr>
                        <th>User Info</th>
                        <th>Role</th>
                        <th>Joined Date</th>
                        <th>Portfolio Settings</th>
                        <th>Activity metrics</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          {/* USER INFO */}
                          <td>
                            <div className="user-info-cell">
                              <span className="user-info-name">{user.name}</span>
                              <span className="user-info-email">{user.email}</span>
                            </div>
                          </td>

                          {/* ROLE BADGE */}
                          <td>
                            <span className={`role-badge badge-${user.role}`}>
                              {user.role}
                            </span>
                          </td>

                          {/* JOINED DATE */}
                          <td>
                            <span className="table-date">
                              {new Date(user.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </span>
                          </td>

                          {/* PORTFOLIO ACCENTS / PRESET */}
                          <td>
                            {user.hasPortfolio && user.portfolioStats ? (
                              <div className="portfolio-style-cell">
                                <span className="style-item-badge text-capitalize">
                                  {user.portfolioStats.templateId}
                                </span>
                                <span className="style-item-badge text-capitalize">
                                  Color: {user.portfolioStats.themeColor}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted font-italic">Not created</span>
                            )}
                          </td>

                          {/* METRICS */}
                          <td>
                            {user.hasPortfolio && user.portfolioStats ? (
                              <div className="metrics-cell">
                                <span title="Portfolio views count">
                                  <strong>Views:</strong> {user.portfolioStats.views}
                                </span>
                                <span title="Contact queries count">
                                  <strong>Contacts:</strong> {user.portfolioStats.contactCount}
                                </span>
                                <span title="Items total count">
                                  <strong>Details:</strong> {
                                    user.portfolioStats.projectsCount +
                                    user.portfolioStats.skillsCount +
                                    user.portfolioStats.experienceCount +
                                    user.portfolioStats.educationCount
                                  } items
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>

                          {/* ACTIONS */}
                          <td>
                            <div className="actions-cell">
                              {user.hasPortfolio && user.username && (
                                <a
                                  href={`/p/${user.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="action-btn-link"
                                  title="View Public Profile"
                                >
                                  <FaLink /> Profile
                                </a>
                              )}
                              <button
                                onClick={() => handleToggleRole(user._id, user.role)}
                                className={`action-btn-toggle ${user.role === 'admin' ? 'demote' : 'promote'}`}
                                title={
                                  user._id === currentUser?._id || user._id === currentUser?.id
                                    ? 'You cannot modify your own role'
                                    : user.role === 'admin'
                                    ? 'Demoting other administrators is not allowed'
                                    : 'Make Administrator'
                                }
                                disabled={
                                  user._id === currentUser?._id ||
                                  user._id === currentUser?.id ||
                                  user.role === 'admin'
                                }
                              >
                                {user.role === 'admin' ? 'Demote' : 'Promote'}
                              </button>

                              {/* Delete Portfolio action */}
                              {user.hasPortfolio && (
                                <button
                                  onClick={() => openDeleteModal('portfolio', user)}
                                  className="action-btn-delete-portfolio"
                                  title="Delete User Portfolio"
                                >
                                  <FaTrashAlt />
                                </button>
                              )}

                              {/* Delete User action (self-delete and other admin protection) */}
                              {user._id !== currentUser?._id && user._id !== currentUser?.id ? (
                                <button
                                  onClick={() => openDeleteModal('user', user)}
                                  className="action-btn-delete-user"
                                  title={user.role === 'admin' ? 'Cannot delete another admin' : 'Delete User Account & Portfolio'}
                                  disabled={user.role === 'admin'}
                                >
                                  <FaUserTimes />
                                </button>
                              ) : (
                                <span className="self-label-indicator">You</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        targetType={deleteModal.targetType}
        targetName={deleteModal.userName}
        targetEmail={deleteModal.userEmail}
      />
    </div>
  );
};

export default AdminDashboard;
