import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { OrderValidation } from '../validations/OrderValidation';
import { saveOrder, getOrders } from '../features/OrderSlice';
import { FaTruck, FaLightbulb } from 'react-icons/fa';

const VEHICLE_LABELS = {
    truck_small:  'Small vehicle (up to 100 kg)',
    truck_medium: 'Medium vehicle (200 kg – 400 kg)',
    truck_large:  'Large vehicle (500 kg – 10 tons)',
};

const ShareOrder = () => {
    const email    = useSelector((s) => s.user.user?.email);
    const dispatch = useDispatch();

    const [isUrgent,       setUrgent]      = useState(false);
    const [scheduledDate,  setScheduledDate] = useState('');
    const [pickupLat, setPickupLat]= useState(null);
    const [pickupLng, setPickupLng]= useState(null);

    const { register, handleSubmit, setValue, reset, formState: { errors } } =
        useForm({ resolver: yupResolver(OrderValidation) });

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setPickupLat(pos.coords.latitude);
                setPickupLng(pos.coords.longitude);
                const label = `My Location (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`;
                setValue('pickupLocation', label, { shouldValidate: true });
            });
        }
    };

    const onSubmit = async (data) => {
        const odata = {
            traderEmail: email,
            pickupLocation:   data.pickupLocation,
            deliveryLocation: data.deliveryLocation,
            pickupLat, pickupLng,
            distance:  parseFloat(data.distance),
            weight:    parseFloat(data.weight),
            vehicleType:          data.vehicleType,
            specialInstructions:  data.cargoType,
            isUrgent,
            scheduledDate: scheduledDate || null
        };
        const result = await dispatch(saveOrder(odata));
        alert(result.payload);
        dispatch(getOrders({ email }));
        reset();
        setUrgent(false);
        setScheduledDate('');
        setPickupLat(null);
        setPickupLng(null);
    };

    return (
        <div className="td-form-grid">
            {/* Left: Form */}
            <div className="td-form-panel">
                <h4><FaTruck style={{ color: '#f5a623' }} /> Post New Shipment</h4>

                <div className="td-input-group">
                    <label>From (Location)</label>
                    <div style={{ display: 'flex', gap: '.5rem' }}>
                        <input className="td-input" placeholder="e.g. Muscat"
                            {...register('pickupLocation')} />
                        <button type="button" className="td-btn-sm" onClick={getLocation}
                            title="Use my location" style={{ padding: '.35rem .75rem', flexShrink: 0 }}>Location</button>
                    </div>
                    {errors.pickupLocation && <p className="td-error">{errors.pickupLocation.message}</p>}
                </div>

                <div className="td-input-group">
                    <label>To (Location)</label>
                    <input className="td-input" placeholder="e.g. Salalah"
                        {...register('deliveryLocation')} />
                    {errors.deliveryLocation && <p className="td-error">{errors.deliveryLocation.message}</p>}
                </div>

                <div className="td-input-group">
                    <label>Cargo Type</label>
                    <input className="td-input" placeholder="e.g. Textiles"
                        {...register('cargoType')} />
                    {errors.cargoType && <p className="td-error">{errors.cargoType.message}</p>}
                </div>

                <div className="td-input-row">
                    <div className="td-input-group">
                        <label>Weight (kg)</label>
                        <input className="td-input" type="number" placeholder="e.g. 500" min="0.1"
                            {...register('weight')} />
                        {errors.weight && <p className="td-error">{errors.weight.message}</p>}
                    </div>
                    <div className="td-input-group">
                        <label>Distance (km)</label>
                        <input className="td-input" type="number" placeholder="e.g. 150" min="1"
                            {...register('distance')} />
                        {errors.distance && <p className="td-error">{errors.distance.message}</p>}
                    </div>
                </div>

                <div className="td-input-group">
                    <label>Vehicle Type</label>
                    <select className="td-input" {...register('vehicleType')}>
                        <option value="">Select vehicle</option>
                        {Object.entries(VEHICLE_LABELS).map(([v, l]) =>
                            <option key={v} value={v}>{l}</option>
                        )}
                    </select>
                    {errors.vehicleType && <p className="td-error">{errors.vehicleType.message}</p>}
                </div>

                <div className="td-input-group">
                    <label>Scheduled Date <span style={{ color: '#7d8590', fontSize: '.78rem' }}>(optional)</span></label>
                    <input
                        className="td-input"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                    <input type="checkbox" id="urgent" checked={isUrgent}
                        onChange={(e) => setUrgent(e.target.checked)}
                        style={{ accentColor: '#f5a623', width: 'auto' }} />
                    <label htmlFor="urgent" style={{ margin: 0, color: '#f85149', fontSize: '.82rem', cursor: 'pointer' }}>
                        Urgent delivery (+15%)
                    </label>
                </div>

                <button className="td-btn-full" onClick={handleSubmit(onSubmit)}>Post Shipment</button>
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
