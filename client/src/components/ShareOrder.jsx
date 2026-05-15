import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { saveOrder, getOrders } from '../features/OrderSlice';
import { FaTruck, FaLightbulb } from 'react-icons/fa';

const VEHICLE_LABELS = {
    bike: 'Bike', auto: 'Auto/Tuk-Tuk',
    truck_small: 'Small Truck', truck_medium: 'Medium Truck',
    truck_large: 'Large Truck', truck_xlarge: 'Extra Large Truck'
};

const ShareOrder = () => {
    const email    = useSelector((s) => s.user.user?.email);
    const dispatch = useDispatch();

    const [pickupLocation,    setPickup]   = useState('');
    const [deliveryLocation,  setDelivery] = useState('');
    const [cargoType,         setCargo]    = useState('');
    const [weight,            setWeight]   = useState('');
    const [distance,          setDistance] = useState('');
    const [vehicleType,       setVehicle]  = useState('');
    const [isUrgent,          setUrgent]   = useState(false);
    const [pickupLat,         setPickupLat]= useState(null);
    const [pickupLng,         setPickupLng]= useState(null);

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setPickupLat(pos.coords.latitude);
                setPickupLng(pos.coords.longitude);
                setPickup(`My Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
            });
        }
    };

    const handlePost = async () => {
        if (!pickupLocation || !deliveryLocation || !distance || !weight || !vehicleType) {
            alert('Please fill in all required fields!');
            return;
        }
        const odata = {
            traderEmail: email,
            pickupLocation,
            deliveryLocation,
            pickupLat, pickupLng,
            distance: parseFloat(distance),
            weight: parseFloat(weight),
            vehicleType,
            specialInstructions: cargoType,
            isUrgent
        };
        const result = await dispatch(saveOrder(odata));
        alert(result.payload);
        dispatch(getOrders({ email }));
        setPickup(''); setDelivery(''); setCargo('');
        setWeight(''); setDistance(''); setVehicle('');
        setUrgent(false);
    };

    return (
        <div className="td-form-grid">
            {/* Left: Form */}
            <div className="td-form-panel">
                <h4><FaTruck style={{ color: '#f5a623' }} /> Post New Shipment</h4>

                <div className="td-input-group">
                    <label>From (Location)</label>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                        <input className="td-input" placeholder="e.g. Lagos" value={pickupLocation}
                            onChange={(e) => setPickup(e.target.value)} />
                        <button className="td-btn-sm" onClick={getLocation} title="Use my location"
                            style={{ padding: '.35rem .75rem', flexShrink: 0 }}>📍</button>
                    </div>
                </div>

                <div className="td-input-group">
                    <label>To (Location)</label>
                    <input className="td-input" placeholder="e.g. Abuja" value={deliveryLocation}
                        onChange={(e) => setDelivery(e.target.value)} />
                </div>

                <div className="td-input-group">
                    <label>Cargo Type</label>
                    <input className="td-input" placeholder="e.g. Textiles" value={cargoType}
                        onChange={(e) => setCargo(e.target.value)} />
                </div>

                <div className="td-input-row">
                    <div className="td-input-group">
                        <label>Weight (kg)</label>
                        <input className="td-input" type="number" placeholder="e.g. 500" min="0.1"
                            value={weight} onChange={(e) => setWeight(e.target.value)} />
                    </div>
                    <div className="td-input-group">
                        <label>Distance (km)</label>
                        <input className="td-input" type="number" placeholder="e.g. 150" min="1"
                            value={distance} onChange={(e) => setDistance(e.target.value)} />
                    </div>
                </div>

                <div className="td-input-group">
                    <label>Vehicle Type</label>
                    <select className="td-input" value={vehicleType}
                        onChange={(e) => setVehicle(e.target.value)}>
                        <option value="">Select vehicle</option>
                        {Object.entries(VEHICLE_LABELS).map(([v, l]) =>
                            <option key={v} value={v}>{l}</option>
                        )}
                    </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                    <input type="checkbox" id="urgent" checked={isUrgent}
                        onChange={(e) => setUrgent(e.target.checked)}
                        style={{ accentColor: '#f5a623', width: 'auto' }} />
                    <label htmlFor="urgent" style={{ margin: 0, color: '#f85149', fontSize: '.82rem', cursor: 'pointer' }}>
                        Urgent delivery (+15%)
                    </label>
                </div>

                <button className="td-btn-full" onClick={handlePost}>Post Shipment</button>
            </div>

            {/* Right: Info */}
            <div>
                <div className="td-info-box">
                    <h5><FaLightbulb /> Shipment Guidelines</h5>
                    <ul>
                        <li>Clearly describe your cargo type</li>
                        <li>Provide accurate weight and dimensions</li>
                        <li>Set competitive pricing for faster matches</li>
                        <li>Drivers can accept within 30 minutes</li>
                        <li>Payment secured in escrow</li>
                    </ul>
                </div>

                <div className="td-info-box">
                    <h5><FaTruck /> How It Works</h5>
                    <ol>
                        <li><strong>Post</strong> — Submit your shipment details</li>
                        <li><strong>Match</strong> — Drivers bid for your shipment</li>
                        <li><strong>Track</strong> — Monitor in real-time</li>
                        <li><strong>Deliver</strong> <em>— Confirm and release payment</em></li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

export default ShareOrder;
