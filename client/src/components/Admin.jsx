import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import Footer from './Footer';
import { FaShieldAlt, FaUsers, FaBoxOpen, FaTachometerAlt, FaCheckCircle, FaTruck, FaClock } from 'react-icons/fa';
import moment from 'moment';

const API = 'http://localhost:3002';

const Admin = () => {
    const [authed,    setAuthed]  = useState(false);
    const [adminPwd,  setAdminPwd]= useState('');
    const [error,     setError]   = useState('');
    const [page,      setPage]    = useState('overview');
    const [users,     setUsers]   = useState([]);
    const [orders,    setOrders]  = useState([]);

    const handleLogin = () => {
        if (adminPwd === 'admin123') {
            setAuthed(true);
            setError('');
        } else {
            setError('Invalid admin credentials.');
        }
    };

    useEffect(() => {
        if (!authed) return;
        axios.get(`${API}/getUsers`).then((r) => setUsers(r.data || []));
        axios.get(`${API}/getOrders`).then((r) => setOrders(r.data?.orders || []));
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
                    <span className="td-demo-badge">DEMO</span>
                    <div className="td-auth-icon"><FaShieldAlt /></div>
                    <h2>Admin Access</h2>
                    <p className="sub">Enter your admin credentials</p>

                    {error && <p className="td-msg-error">{error}</p>}

                    <div className="td-input-group">
                        <label>Admin Email</label>
                        <input className="td-input" type="email" placeholder="admin@example.com" disabled
                            defaultValue="admin@traders-drivers.com" style={{ opacity: .6 }} />
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
                                        <th>Role</th>
                                        <th>Status</th>
                                        <th>Joined</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u._id}>
                                            <td>{u.fullName}</td>
                                            <td>
                                                <span className={`td-role-tag ${u.userType}`}>
                                                    {u.userType}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`td-status-dot ${u.isActive ? 'active' : 'pending'}`}>
                                                    {u.isActive ? 'Active' : 'Pending'}
                                                </span>
                                            </td>
                                            <td style={{ color: '#7d8590' }}>
                                                {moment(u.createdAt).format('MMM D, YYYY')}
                                            </td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} style={{ color: '#7d8590', textAlign: 'center', padding: '2rem' }}>
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
