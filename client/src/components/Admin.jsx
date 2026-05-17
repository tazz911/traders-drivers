import { useState, useEffect } from 'react';
import apiClient from '../api/axiosConfig';
import Header from './Header';
import Footer from './Footer';
import { FaShieldAlt, FaUsers, FaBoxOpen, FaTachometerAlt, FaCheckCircle, FaTruck, FaClock } from 'react-icons/fa';
import moment from 'moment';

const Admin = () => {
    const [authed,      setAuthed]     = useState(false);
    const [adminEmail,  setAdminEmail] = useState('');
    const [adminPwd,    setAdminPwd]   = useState('');
    const [error,       setError]      = useState('');
    const [page,        setPage]       = useState('overview');
    const [users,       setUsers]      = useState([]);
    const [orders,      setOrders]     = useState([]);
    const [expandedUser, setExpandedUser] = useState(null);

    const handleLogin = async () => {
        try {
            const res = await apiClient.post(`/adminLogin`, { email: adminEmail, password: adminPwd });
            if (res.data.message === 'success') {
                setAuthed(true);
                setError('');
            } else {
                setError(res.data.message || 'Invalid admin credentials.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid admin credentials.');
        }
    };

    const handleTerminate = async (userId) => {
        if (!window.confirm('Deactivate this user? They will no longer be able to log in.')) return;
        try {
            await apiClient.put(`/deactivateUser/${userId}`);
            setUsers((prev) => prev.map((u) => u._id === userId ? { ...u, isActive: false } : u));
        } catch {
            alert('Failed to deactivate user.');
        }
    };

    useEffect(() => {
        if (!authed) return;
        apiClient.get(`/getUsers`).then((r) => setUsers(r.data || []));
        apiClient.get(`/getOrders`).then((r) => setOrders(r.data?.orders || []));
    }, [authed]);

    const totalUsers     = users.length;
    const activeShipments= orders.filter((o) => ['accepted','in_transit'].includes(o.status)).length;
    const revenue        = orders.filter((o) => o.isPaid).reduce((s, o) => s + (o.estimatedFare || 0), 0);
    const avgRating      = 4.8;

    /* ── Admin Login ── */
    if (!authed) return (
        <div className="td-auth-page">
            <Header />
            <div className="td-auth-center">
                <div className="td-auth-card">
                    <div className="td-auth-icon"><FaShieldAlt /></div>
                    <h2>Admin Access</h2>
                    <p className="sub">Enter your admin credentials</p>

                    {error && <p className="td-msg-error">{error}</p>}

                    <div className="td-input-group">
                        <label>Admin Email</label>
                        <input className="td-input" type="email" placeholder="admin@example.com"
                            value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                    </div>
                    <div className="td-input-group">
                        <label>Password</label>
                        <input className="td-input" type="password" placeholder="••••••••"
                            value={adminPwd} onChange={(e) => setAdminPwd(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
                        <input type="checkbox" id="remember" style={{ accentColor: '#f5a623', width: 'auto' }} />
                        <label htmlFor="remember" style={{ margin: 0, fontSize: '.8rem', cursor: 'pointer' }}>
                            Remember this device
                        </label>
                    </div>
                    <button className="td-btn-full" onClick={handleLogin}>Access Dashboard</button>
                </div>
            </div>
            <Footer />
        </div>
    );

    /* ── Admin Dashboard ── */
    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <div className="td-admin-wrap">
                {/* Sidebar */}
                <aside className="td-admin-sidebar">
                    <div className="td-admin-sidebar-label">
                        <FaShieldAlt /> Admin Panel
                    </div>
                    <ul className="td-admin-nav">
                        <li>
                            <button className={page === 'overview' ? 'active' : ''} onClick={() => setPage('overview')}>
                                <FaTachometerAlt /> Overview
                            </button>
                        </li>
                        <li>
                            <button className={page === 'users' ? 'active' : ''} onClick={() => setPage('users')}>
                                <FaUsers /> Users
                            </button>
                        </li>
                        <li>
                            <button className={page === 'shipments' ? 'active' : ''} onClick={() => setPage('shipments')}>
                                <FaBoxOpen /> Shipments
                            </button>
                        </li>
                    </ul>
                </aside>

                {/* Main content */}
                <main className="td-admin-content">

                    {/* Overview */}
                    {page === 'overview' && (
                        <>
                            <h2>Dashboard Overview</h2>
                            <div className="td-stat-grid">
                                <div className="td-stat-card">
                                    <div className="td-stat-label">Total Users</div>
                                    <div className="td-stat-value">{totalUsers.toLocaleString()}</div>
                                    <div className="td-stat-change">↑ 12% this month</div>
                                </div>
                                <div className="td-stat-card">
                                    <div className="td-stat-label">Active Shipments</div>
                                    <div className="td-stat-value">{activeShipments.toLocaleString()}</div>
                                    <div className="td-stat-change">↑ 8% this week</div>
                                </div>
                                <div className="td-stat-card">
                                    <div className="td-stat-label">Revenue</div>
                                    <div className="td-stat-value">OMR {revenue.toFixed(0)}</div>
                                    <div className="td-stat-change">↑ 23% this month</div>
                                </div>
                                <div className="td-stat-card">
                                    <div className="td-stat-label">Avg Rating</div>
                                    <div className="td-stat-value">{avgRating}</div>
                                    <div className="td-stat-change" style={{ color: '#7d8590' }}>
                                        From {users.length} reviews
                                    </div>
                                </div>
                            </div>

                            <div className="td-activity-box">
                                <h4>Recent Activity</h4>
                                {orders.slice(0, 5).map((o, i) => (
                                    <div key={o._id} className="td-act-item">
                                        <div className={`td-act-dot ${i % 3 === 0 ? 'green' : i % 3 === 1 ? 'blue' : 'orange'}`}>
                                            {o.status === 'completed' ? <FaCheckCircle /> : <FaTruck />}
                                        </div>
                                        <div className="td-act-text">
                                            <strong>
                                                {o.status === 'completed' ? 'Shipment delivered' : 'Shipment posted'} —&nbsp;
                                                {o.pickupLocation} → {o.deliveryLocation}
                                            </strong>
                                            <span>{moment(o.createdAt).fromNow()}</span>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && (
                                    <p style={{ color: '#7d8590', fontSize: '.83rem' }}>No recent activity.</p>
                                )}
                            </div>
                        </>
                    )}

                    {/* Users */}
                    {page === 'users' && (
                        <>
                            <h2>User Management</h2>
                            <table className="td-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email / Phone</th>
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <>
                                            <tr key={u._id}
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}>
                                                <td style={{ fontWeight: 600 }}>
                                                    {expandedUser === u._id ? '▾' : '▸'} {u.fullName}
                                                </td>
                                                <td style={{ color: '#7d8590', fontSize: '.8rem' }}>
                                                    {u.email}<br />{u.phone}
                                                </td>
                                                <td>
                                                    <span className={`td-role-tag ${u.userType}`}>
                                                        {u.userType === 'trader' ? '🏪' : '🚛'} {u.userType}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`td-status-dot ${u.isActive ? 'active' : 'pending'}`}>
                                                        {u.isActive ? 'Active' : 'Deactivated'}
                                                    </span>
                                                </td>
                                                <td style={{ color: '#7d8590' }}>
                                                    {moment(u.createdAt).format('MMM D, YYYY')}
                                                </td>
                                                <td onClick={(e) => e.stopPropagation()}>
                                                    {u.isActive ? (
                                                        <button
                                                            onClick={() => handleTerminate(u._id)}
                                                            style={{
                                                                background: '#c0392b', color: '#fff',
                                                                border: 'none', borderRadius: '6px',
                                                                padding: '4px 12px', cursor: 'pointer',
                                                                fontSize: '.78rem', fontWeight: 600
                                                            }}
                                                        >
                                                            Terminate
                                                        </button>
                                                    ) : (
                                                        <span style={{ color: '#7d8590', fontSize: '.78rem' }}>—</span>
                                                    )}
                                                </td>
                                            </tr>

                                            {expandedUser === u._id && (
                                                <tr key={`${u._id}-detail`}>
                                                    <td colSpan={6} style={{ background: '#161b22', padding: '1rem 1.5rem', borderBottom: '1px solid #30363d' }}>
                                                        {u.userType === 'driver' ? (
                                                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                                                <div>
                                                                    <span style={{ color: '#7d8590', fontSize: '.75rem', display: 'block' }}>License Number</span>
                                                                    <span style={{ color: '#e6edf3', fontWeight: 600 }}>{u.licenseNumber || '—'}</span>
                                                                </div>
                                                                <div>
                                                                    <span style={{ color: '#7d8590', fontSize: '.75rem', display: 'block' }}>Vehicle Type</span>
                                                                    <span style={{ color: '#e6edf3', fontWeight: 600 }}>{u.vehicleType || '—'}</span>
                                                                </div>
                                                                <div>
                                                                    <span style={{ color: '#7d8590', fontSize: '.75rem', display: 'block' }}>Base Rate / km</span>
                                                                    <span style={{ color: '#f5a623', fontWeight: 600 }}>OMR {u.baseRate ?? '—'}</span>
                                                                </div>
                                                                <div>
                                                                    <span style={{ color: '#7d8590', fontSize: '.75rem', display: 'block' }}>Rating</span>
                                                                    <span style={{ color: '#e6edf3', fontWeight: 600 }}>⭐ {u.rating ?? '—'}</span>
                                                                </div>
                                                                <div>
                                                                    <span style={{ color: '#7d8590', fontSize: '.75rem', display: 'block' }}>Total Trips</span>
                                                                    <span style={{ color: '#e6edf3', fontWeight: 600 }}>{u.totalTrips ?? 0}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                                                                <div>
                                                                    <span style={{ color: '#7d8590', fontSize: '.75rem', display: 'block' }}>Company Name</span>
                                                                    <span style={{ color: '#e6edf3', fontWeight: 600 }}>{u.companyName || '—'}</span>
                                                                </div>
                                                                <div>
                                                                    <span style={{ color: '#7d8590', fontSize: '.75rem', display: 'block' }}>Reg. Number</span>
                                                                    <span style={{ color: '#e6edf3', fontWeight: 600 }}>{u.registrationNumber || '—'}</span>
                                                                </div>
                                                                <div>
                                                                    <span style={{ color: '#7d8590', fontSize: '.75rem', display: 'block' }}>Business Category</span>
                                                                    <span style={{ color: '#e6edf3', fontWeight: 600 }}>{u.businessCategory || '—'}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ color: '#7d8590', textAlign: 'center', padding: '2rem' }}>
                                                No users found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </>
                    )}

                    {/* Shipments */}
                    {page === 'shipments' && (
                        <>
                            <h2>Shipment Tracking</h2>
                            {orders.map((o) => (
                                <div key={o._id} className="td-ship-row">
                                    <div className={`td-ship-icon ${o.status}`}>
                                        {o.status === 'completed' ? <FaCheckCircle /> : <FaTruck />}
                                    </div>
                                    <div className="td-ship-info">
                                        <div className="td-ship-title">
                                            #{o._id.slice(-6).toUpperCase()} — {o.pickupLocation} → {o.deliveryLocation}
                                        </div>
                                        <div className="td-ship-sub">
                                            {o.weight}kg {o.vehicleType} · OMR {o.estimatedFare?.toFixed(3)}
                                        </div>
                                    </div>
                                    <span className={`td-ship-badge ${o.status}`}>
                                        {o.status.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                            {orders.length === 0 && (
                                <div className="td-empty">
                                    <div className="td-empty-icon"><FaBoxOpen /></div>
                                    <p>No shipments found.</p>
                                </div>
                            )}
                        </>
                    )}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Admin;
