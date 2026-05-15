import { Link } from 'react-router-dom';
import { FaBox, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';

const LandingPage = () => (
    <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />

        <main style={{ flex: 1 }}>
            {/* Hero */}
            <div className="td-hero">
                <div className="td-hero-tag">Connecting Logistics</div>
                <h1>The Smartest Way to<br /><span>Move Freight</span></h1>
                <p className="td-hero-sub">
                    Connecting traders with reliable drivers. Real-time tracking,
                    instant booking, and seamless logistics management.
                </p>
                <Link to="/register" className="td-btn">Get Started Free</Link>
            </div>

            {/* How It Works */}
            <div className="td-how">
                <h2>How It <span>Works</span></h2>
                <div className="td-feature-grid">
                    <div className="td-feature-card">
                        <div className="td-feature-icon"><FaBox /></div>
                        <h4>Post a Shipment</h4>
                        <p>Traders post shipment details including pickup, destination, and cargo type. Get matched instantly.</p>
                    </div>
                    <div className="td-feature-card">
                        <div className="td-feature-icon"><FaMapMarkerAlt /></div>
                        <h4>Track in Real-Time</h4>
                        <p>Live GPS tracking for every shipment. Know exactly where your cargo is at all times.</p>
                    </div>
                    <div className="td-feature-card">
                        <div className="td-feature-icon"><FaShieldAlt /></div>
                        <h4>Secure Payments</h4>
                        <p>Escrow-protected payments released on delivery confirmation. Safe for everyone.</p>
                    </div>
                </div>
            </div>
        </main>

        <Footer />
    </div>
);

export default LandingPage;
