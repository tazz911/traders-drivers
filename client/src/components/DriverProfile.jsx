import { useState } from 'react';
import { useSelector } from 'react-redux';
import apiClient from '../api/axiosConfig';
import { FaUser, FaSave } from 'react-icons/fa';

const VEHICLE_LABELS = {
    truck_small:  'Small vehicle (up to 100 kg)',
    truck_medium: 'Medium vehicle (200 kg – 400 kg)',
    truck_large:  'Large vehicle (500 kg – 10 tons)',
};

const DriverProfile = () => {
    const user = useSelector((s) => s.user.user);

    const [vehicleType, setVehicle]  = useState(user?.vehicleType || '');
    const [profilePic,  setPic]      = useState(user?.profilePic  || '');
    const [message,     setMessage]  = useState('');
    const [isError,     setIsError]  = useState(false);

    const handleSave = async () => {
        try {
            const res = await apiClient.put('/updateProfile', {
                email: user.email, vehicleType, profilePic
            });
            setMessage(res.data.message);
            setIsError(false);
        } catch {
            setMessage('Update failed. Please try again.');
            setIsError(true);
        }
    };

    return (
        <div style={{ maxWidth: 480 }}>
            <div className="td-form-panel">
                <h4><FaUser style={{ color: '#f5a623' }} /> Driver Profile</h4>

                {/* Avatar preview */}
                <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                    {profilePic ? (
                        <img src={profilePic} alt="Profile"
                            style={{ width: 88, height: 88, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #f5a623' }}
                            onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                        <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#f5a623', color: '#0d1117', fontSize: '2rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            {user?.fullName?.[0]?.toUpperCase()}
                        </div>
                    )}
                </div>

                <div className="td-input-group">
                    <label>Profile Picture URL</label>
                    <input className="td-input" type="url" placeholder="https://example.com/photo.jpg"
                        value={profilePic} onChange={(e) => setPic(e.target.value)} />
                    <span style={{ fontSize: '.75rem', color: '#7d8590' }}>Paste a direct image link — shown to traders when you accept their order</span>
                </div>

                <div className="td-input-group">
                    <label>Vehicle Type</label>
                    <select className="td-input" value={vehicleType} onChange={(e) => setVehicle(e.target.value)}>
                        <option value="">Select vehicle</option>
                        {Object.entries(VEHICLE_LABELS).map(([v, l]) =>
                            <option key={v} value={v}>{l}</option>
                        )}
                    </select>
                </div>

                <div className="td-input-group">
                    <label>Full Name</label>
                    <input className="td-input" value={user?.fullName || ''} disabled style={{ opacity: .5 }} />
                </div>

                <div className="td-input-group">
                    <label>Email</label>
                    <input className="td-input" value={user?.email || ''} disabled style={{ opacity: .5 }} />
                </div>

                <div className="td-input-group">
                    <label>Phone</label>
                    <input className="td-input" value={user?.phone || ''} disabled style={{ opacity: .5 }} />
                </div>

                <button className="td-btn-full" onClick={handleSave}>
                    <FaSave style={{ marginRight: '.4rem' }} /> Save Changes
                </button>

                {message && (
                    <p className={isError ? 'td-msg-error' : 'td-msg-success'} style={{ marginTop: '.75rem', textAlign: 'center' }}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
};

export default DriverProfile;
