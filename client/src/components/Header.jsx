import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/UserSlice';

const Header = () => {
    const location  = useLocation();
    const navigate  = useNavigate();
    const dispatch  = useDispatch();
    const username  = useSelector((s) => s.user.user?.fullName);
    const userType  = useSelector((s) => s.user.user?.userType);
    const [search, setSearch] = useState('');

    const active = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = (e) => {
        e.preventDefault();
        dispatch(logout());
        navigate('/');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/tracking?search=${search.trim()}`);
            setSearch('');
        }
    };

    return (
        <nav className="td-nav">
            <Link to="/" className="td-logo">
                <div className="td-logo-box">TD</div>
                <span className="td-logo-text">Traders<span> &amp; Drivers</span></span>
            </Link>

            {username && (
                <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                    <input
                        data-testid="navbar-search"
                        className="td-input"
                        style={{ width: '200px', padding: '.35rem .75rem', fontSize: '.82rem' }}
                        placeholder="Track order ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="td-btn-sm" style={{ padding: '.35rem .7rem' }}>
                        🔍
                    </button>
                </form>
            )}

            <ul className="td-nav-links">
                {!username ? (
                    <>
                        <li><Link to="/" className={active('/')}>Home</Link></li>
                        <li><Link to="/login" className={active('/login')}>Login</Link></li>
                        <li><Link to="/register" className={active('/register')}>Register</Link></li>
                        <li><Link to="/admin" className={active('/admin')}>Admin</Link></li>
                    </>
                ) : (
                    <>
                        <li>
                            <span style={{ color: '#f5a623', fontWeight: 600, fontSize: '.85rem' }}>
                                {userType === 'trader' ? '🏪' : '🚛'} {username.split(' ')[0]}
                            </span>
                        </li>
                        <li><Link to="/home" className={active('/home')}>Dashboard</Link></li>
                        <li>
                            <a href="#" onClick={handleLogout} style={{ color: '#7d8590' }}>Logout</a>
                        </li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Header;
