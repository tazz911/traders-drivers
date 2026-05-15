import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/UserSlice';

const Header = () => {
    const location = useLocation();
    const navigate  = useNavigate();
    const dispatch  = useDispatch();
    const username  = useSelector((s) => s.user.user?.fullName);

    const active = (path) => location.pathname === path ? 'active' : '';

    const handleLogout = (e) => {
        e.preventDefault();
        dispatch(logout());
        navigate('/');
    };

    return (
        <nav className="td-nav">
            <Link to="/" className="td-logo">
                <div className="td-logo-box">Cb</div>
                <span className="td-logo-text">Traders<span>&amp;Drivers</span></span>
            </Link>
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
