import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateLocation } from '../features/UserSlice';
import { getDriverOrders } from '../features/OrderSlice';
import Header from './Header';
import Footer from './Footer';
import ShareOrder from './ShareOrder';
import Orders from './Orders';
import DriverProfile from './DriverProfile';
import moment from 'moment';
import { FaBriefcase, FaTruck, FaPlus, FaMapMarkedAlt, FaSearch, FaShippingFast, FaMap, FaUser } from 'react-icons/fa';

const Home = () => {
    const email       = useSelector((s) => s.user.user?.email);
    const userType    = useSelector((s) => s.user.user?.userType);
    const fullName    = useSelector((s) => s.user.user?.fullName);
    const driverOrders= useSelector((s) => s.order.driverOrders);
    const navigate    = useNavigate();
    const dispatch    = useDispatch();
    const [tab, setTab] = useState(0);

    useEffect(() => {
        if (!email) navigate('/login');
    }, [email]);

    useEffect(() => {
        if (email && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                dispatch(updateLocation({
                    email,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                }));
            });
        }
    }, [email]);

    if (!email) return null;

    /* ── Trader Dashboard ── */
    if (userType === 'trader') return (
        <div className="td-dashboard">
            <Header />
            <div className="td-dash-header">
                <h2><FaBriefcase style={{ color: '#f5a623' }} /> Trader Dashboard</h2>
                <p>Manage your shipments and track deliveries.</p>
            </div>
            <div className="td-dash-tabs">
                <button className={`td-tab ${tab === 0 ? 'active' : ''}`} onClick={() => setTab(0)}>
                    <FaPlus /> Create Order
                </button>
                <button className={`td-tab ${tab === 1 ? 'active' : ''}`} onClick={() => setTab(1)}>
                    <FaMapMarkedAlt /> Track Orders
                </button>
                <button className="td-tab" onClick={() => navigate('/tracking')}>
                    <FaMap /> Live Map
                </button>
            </div>
            <div className="td-dash-body">
                {tab === 0 && <ShareOrder />}
                {tab === 1 && <Orders />}
            </div>
            <Footer />
        </div>
    );

    /* ── Driver Dashboard ── */
    const activeDeliveries = driverOrders.filter((o) => !o.isPaid);

    return (
        <div className="td-dashboard">
            <Header />
            <div className="td-dash-header">
                <h2><FaTruck style={{ color: '#f5a623' }} /> Driver Dashboard</h2>
                <p>View available orders and track active deliveries.</p>
            </div>
            <div className="td-dash-tabs">
                <button className={`td-tab ${tab === 0 ? 'active' : ''}`} onClick={() => setTab(0)}>
                    <FaSearch /> Available Orders
                </button>
                <button className={`td-tab ${tab === 1 ? 'active' : ''}`} onClick={() => { setTab(1); dispatch(getDriverOrders({ driverEmail: email })); }}>
                    <FaShippingFast /> Active Deliveries
                </button>
                <button className={`td-tab ${tab === 2 ? 'active' : ''}`} onClick={() => setTab(2)}>
                    <FaUser /> Profile
                </button>
            </div>
            <div className="td-dash-body">
                {tab === 0 && <Orders />}
                {tab === 1 && (
                    activeDeliveries.length === 0 ? (
                        <div className="td-empty">
                            <div className="td-empty-icon"><FaShippingFast /></div>
                            <p>No active deliveries</p>
                        </div>
                    ) : (
                        <div>
                            {activeDeliveries.map((order) => (
                                <div key={order._id} className="td-order-card">
                                    <div className={`td-order-dot accepted`}><FaTruck /></div>
                                    <div className="td-order-info">
                                        <div className="td-order-route">
                                            #{order._id.slice(-6).toUpperCase()} &nbsp;
                                            {order.pickupLocation} → {order.deliveryLocation}
                                        </div>
                                        <div className="td-order-meta">
                                            {order.weight} kg &nbsp;·&nbsp;
                                            {order.distance} km &nbsp;·&nbsp;
                                            OMR {order.estimatedFare?.toFixed(3)} &nbsp;·&nbsp;
                                            {moment(order.createdAt).fromNow()}
                                        </div>
                                    </div>
                                    <div className="td-order-right">
                                        <span className="td-badge accepted">accepted</span>
                                        <span style={{ fontSize: '.75rem', color: '#7d8590', marginTop: '.25rem' }}>
                                            Waiting for trader payment
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
                {tab === 2 && <DriverProfile />}
            </div>
            <Footer />
        </div>
    );
};

export default Home;
