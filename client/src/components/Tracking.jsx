import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getOrders } from '../features/OrderSlice';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import Header from './Header';
import Footer from './Footer';

const mapStyle = { width: '100%', height: '380px', borderRadius: '10px' };
const MUSCAT   = { lat: 23.5957, lng: 58.4059 };
const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';
const STATUS_STEPS = ['pending', 'accepted', 'in_transit', 'completed'];

const MapView = ({ order }) => {
    const [selected, setSelected] = useState(null);
    const { isLoaded } = useJsApiLoader({ googleMapsApiKey: GMAPS_KEY, libraries: ['places'] });

    const pickup   = order?.pickupLat   ? { lat: order.pickupLat,   lng: order.pickupLng   } : null;
    const delivery = order?.deliveryLat ? { lat: order.deliveryLat, lng: order.deliveryLng } : null;
    const driver   = order?.driver?.[0]?.lat ? { lat: order.driver[0].lat, lng: order.driver[0].lng } : null;

    if (!isLoaded) return (
        <div style={{ ...mapStyle, background: '#161b22', border: '1px solid #30363d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7d8590', fontSize: '.9rem' }}>
            Loading map...
        </div>
    );

    if (!pickup && !driver) return (
        <div style={{ ...mapStyle, background: '#161b22', border: '1px solid #30363d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '.5rem', color: '#7d8590', fontSize: '.9rem' }}>
            <span style={{ fontSize: '1.5rem' }}>Location</span>
            Enable location on pickup to see the map
        </div>
    );

    const center   = pickup || driver || MUSCAT;

    return (
        <GoogleMap mapContainerStyle={mapStyle} center={center} zoom={pickup ? 7 : 6}>
            {pickup && <Marker position={pickup}
                icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#f5a623', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 }}
                onClick={() => setSelected({ pos: pickup, label: 'Pickup: ' + order.pickupLocation })} />}
            {delivery && <Marker position={delivery}
                icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 10, fillColor: '#3fb950', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 }}
                onClick={() => setSelected({ pos: delivery, label: 'Delivery: ' + order.deliveryLocation })} />}
            {driver && <Marker position={driver}
                icon={{ path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6, fillColor: '#58a6ff', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 }}
                onClick={() => setSelected({ pos: driver, label: 'Driver location' })} />}
            {pickup && delivery && (
                <Polyline path={[pickup, ...(driver ? [driver] : []), delivery]}
                    options={{ strokeColor: '#f5a623', strokeOpacity: .8, strokeWeight: 3 }} />
            )}
            {selected && (
                <InfoWindow position={selected.pos} onCloseClick={() => setSelected(null)}>
                    <div style={{ color: '#000', fontWeight: 600, fontSize: '13px' }}>{selected.label}</div>
                </InfoWindow>
            )}
        </GoogleMap>
    );
};

const Tracking = () => {
    const dispatch       = useDispatch();
    const orders         = useSelector((s) => s.order.orders);
    const email          = useSelector((s) => s.user.user?.email);
    const navigate       = useNavigate();
    const [searchParams] = useSearchParams();
    const [searchId, setSearchId] = useState(searchParams.get('search') || '');
    const [found,    setFound]    = useState(null);

    useEffect(() => { if (!email) navigate('/login'); }, [email]);
    useEffect(() => { if (email) dispatch(getOrders({ email })); }, [email]);
    useEffect(() => {
        if (searchId) {
            const o = orders.find((o) =>
                o._id.includes(searchId) ||
                o._id.slice(-8).toUpperCase().includes(searchId.toUpperCase())
            );
            setFound(o || null);
        } else {
            setFound(null);
        }
    }, [searchId, orders]);

    return (
        <div style={{ background: '#0d1117', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main style={{ flex: 1, padding: '2rem' }}>
                <h2 style={{ color: '#e6edf3', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
                    Live Map &amp; Tracking
                </h2>

                {/* Search bar */}
                <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem' }}>
                    <input
                        className="td-input"
                        style={{ maxWidth: '420px' }}
                        placeholder="Search by Order ID (last 8 chars)..."
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        data-testid="tracking-search"
                    />
                    {searchId && (
                        <button className="td-btn-sm muted" onClick={() => setSearchId('')}>Clear</button>
                    )}
                </div>

                {searchId && !found && (
                    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '10px', padding: '1.25rem', color: '#f85149', marginBottom: '1rem' }}>
                        Order not found.
                    </div>
                )}

                {found && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* Order details */}
                        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                                <div>
                                    <h3 style={{ color: '#e6edf3', margin: '0 0 .25rem', fontSize: '1.1rem' }}>
                                        Order #{found._id.slice(-8).toUpperCase()}
                                    </h3>
                                    <p style={{ color: '#7d8590', margin: '0 0 .25rem', fontSize: '.85rem' }}>
                                        {found.pickupLocation} → {found.deliveryLocation}
                                    </p>
                                    <p style={{ color: '#f5a623', fontWeight: 700, margin: 0, fontSize: '.9rem' }}>
                                        OMR {found.estimatedFare?.toFixed(3)}
                                    </p>
                                </div>
                                <span className={`td-badge ${found.status}`} style={{ fontSize: '.8rem', padding: '5px 14px' }}>
                                    {found.status.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div style={{ display: 'flex', marginBottom: '1.5rem' }}>
                                {STATUS_STEPS.map((step, i) => {
                                    const idx  = STATUS_STEPS.indexOf(found.status);
                                    const done = i <= idx && found.status !== 'cancelled';
                                    return (
                                        <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', margin: '0 auto .4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem', background: done ? '#f5a623' : '#21262d', color: done ? '#0d1117' : '#7d8590', border: `2px solid ${done ? '#f5a623' : '#30363d'}` }}>
                                                {done ? '✓' : i + 1}
                                            </div>
                                            <div style={{ fontSize: '.72rem', color: done ? '#f5a623' : '#7d8590', textTransform: 'capitalize' }}>
                                                {step.replace('_', ' ')}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Stats row */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '.75rem' }}>
                                {[['Vehicle', found.vehicleType], ['Distance', found.distance + ' km'], ['Weight', found.weight + ' kg'], ['Payment', found.isPaid ? '✓ Paid' : 'Pending']].map(([k, v]) => (
                                    <div key={k} style={{ background: '#0d1117', border: '1px solid #30363d', padding: '.75rem', borderRadius: '8px' }}>
                                        <div style={{ color: '#7d8590', fontSize: '.72rem', marginBottom: '.2rem' }}>{k}</div>
                                        <div style={{ color: '#e6edf3', fontWeight: 600, fontSize: '.85rem' }}>{v}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Map */}
                        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '1.5rem' }}>
                            <h4 style={{ color: '#e6edf3', fontSize: '.9rem', marginBottom: '1rem' }}>Live Map</h4>
                            <MapView order={found} />
                            {found.driver?.[0] && (
                                <div style={{ marginTop: '1rem', background: '#0d1117', border: '1px solid #30363d', padding: '1rem', borderRadius: '8px', color: '#e6edf3', fontSize: '.85rem' }}>
                                    <strong>Driver:</strong> {found.driver[0].fullName} — {found.driver[0].phone}
                                    {found.driver[0].rating && <> ⭐ {found.driver[0].rating}</>}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Order list when no search */}
                {!searchId && (
                    <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: '12px', padding: '1.5rem' }}>
                        <h4 style={{ color: '#e6edf3', fontSize: '.9rem', marginBottom: '1rem' }}>All Orders</h4>
                        {orders.length === 0
                            ? <p style={{ color: '#7d8590', fontSize: '.85rem', margin: 0 }}>No orders yet.</p>
                            : orders.map((order) => (
                                <div key={order._id}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.85rem', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px', marginBottom: '.5rem', cursor: 'pointer' }}
                                    onClick={() => setSearchId(order._id.slice(-8))}>
                                    <div>
                                        <span style={{ color: '#e6edf3', fontWeight: 600, fontSize: '.85rem' }}>
                                            #{order._id.slice(-8).toUpperCase()}
                                        </span>
                                        <span style={{ color: '#7d8590', fontSize: '.8rem', marginLeft: '1rem' }}>
                                            {order.pickupLocation} → {order.deliveryLocation}
                                        </span>
                                    </div>
                                    <span className={`td-badge ${order.status}`}>{order.status.replace('_', ' ')}</span>
                                </div>
                            ))
                        }
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Tracking;
