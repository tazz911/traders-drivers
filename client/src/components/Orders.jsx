import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOrders, getAvailableOrders, delOrder, updOrder, acceptOrder, completeOrder, cancelOrder, payOrder } from '../features/OrderSlice';
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import moment from 'moment';
import { MdDeleteOutline } from 'react-icons/md';
import { CiEdit } from 'react-icons/ci';
import { FaCheckCircle, FaTimes, FaCreditCard, FaTruck, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';

const VEHICLE_LABELS = {
    truck_small:  'Small vehicle (up to 100 kg)',
    truck_medium: 'Medium vehicle (200 kg – 400 kg)',
    truck_large:  'Large vehicle (500 kg – 10 tons)',
};

const STATUS_ICON = {
    pending:    <FaSearch />,
    accepted:   <FaTruck />,
    in_transit: <MdLocalShipping />,
    completed:  <FaCheckCircle />,
    cancelled:  <FaTimes />
};

const Orders = () => {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const email     = useSelector((s) => s.user.user?.email);
    const userType  = useSelector((s) => s.user.user?.userType);
    const orders    = useSelector((s) => s.order.orders);
    const available = useSelector((s) => s.order.availableOrders);
    const status    = useSelector((s) => s.order.status);

    const [modal,        setModal]    = useState(false);
    const [editId,       setEditId]   = useState('');
    const [editPickup,   setEditPu]   = useState('');
    const [editDelivery, setEditDl]   = useState('');
    const [editDist,     setEditDist] = useState('');
    const [editWeight,   setEditWt]   = useState('');
    const [editVehicle,  setEditV]    = useState('');
    const [editMsg,      setEditMsg]  = useState('');
    const [editUrgent,   setEditUg]   = useState(false);
    const [editErrors,   setEditErrors] = useState({});
    const [statusFilter, setFilter]   = useState('');
    const [payModal,        setPayModal]    = useState(false);
    const [payId,           setPayId]       = useState('');
    const [payAmt,          setPayAmt]      = useState(0);
    const [cardHolder,      setCardHolder]  = useState('');
    const [cardNumber,      setCardNumber]  = useState('');
    const [cardExpiry,      setCardExpiry]  = useState('');
    const [cardCVV,         setCardCVV]     = useState('');
    const [cardErrors,      setCardErrors]  = useState({});

    useEffect(() => {
        if (userType === 'trader') dispatch(getOrders({ email, status: statusFilter || undefined }));
        if (userType === 'driver') dispatch(getAvailableOrders());
    }, [email, userType, statusFilter]);

    const displayOrders = userType === 'trader' ? orders : available;

    const handleDel = (orderid) => {
        if (window.confirm('Delete this order?'))
            dispatch(delOrder(orderid)).then(() => dispatch(getOrders({ email })));
    };

    const openEdit = (order) => {
        setModal(true); setEditId(order._id);
        setEditPu(order.pickupLocation); setEditDl(order.deliveryLocation);
        setEditDist(order.distance); setEditWt(order.weight);
        setEditV(order.vehicleType); setEditMsg(order.specialInstructions || '');
        setEditUg(order.isUrgent);
        setEditErrors({});
    };

    const validateEdit = () => {
        const errs = {};
        if (!editPickup.trim())   errs.pickupLocation   = 'Pickup location is required';
        if (!editDelivery.trim()) errs.deliveryLocation = 'Delivery location is required';
        if (!editWeight || parseFloat(editWeight) <= 0) errs.weight = 'Weight must be greater than 0';
        if (!editDist   || parseFloat(editDist)   < 1)  errs.distance = 'Distance must be at least 1 km';
        if (!editVehicle) errs.vehicleType = 'Please select a vehicle type';
        setEditErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleUpdate = () => {
        if (!validateEdit()) return;
        dispatch(updOrder({
            orderid: editId, pickupLocation: editPickup, deliveryLocation: editDelivery,
            distance: parseFloat(editDist), weight: parseFloat(editWeight),
            vehicleType: editVehicle, specialInstructions: editMsg, isUrgent: editUrgent
        })).then(() => { dispatch(getOrders({ email })); setModal(false); });
    };

    const handleAccept = (orderid) =>
        dispatch(acceptOrder({ orderid, driverEmail: email }))
            .then(() => dispatch(getAvailableOrders()));

    const handleComplete = (orderid) =>
        dispatch(completeOrder({ orderid })).then(() => dispatch(getOrders({ email })));

    const handleCancel = (orderid) => {
        if (window.confirm('Cancel this order?'))
            dispatch(cancelOrder({ orderid })).then(() => dispatch(getOrders({ email })));
    };

    const openPay = (orderid, fare) => {
        setPayId(orderid); setPayAmt(fare); setPayModal(true);
        setCardHolder(''); setCardNumber(''); setCardExpiry(''); setCardCVV(''); setCardErrors({});
    };

    const formatCardNumber = (val) =>
        val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();

    const formatExpiry = (val) => {
        const digits = val.replace(/\D/g, '').slice(0, 4);
        return digits.length >= 3 ? digits.slice(0, 2) + '/' + digits.slice(2) : digits;
    };

    const validateCard = () => {
        const errs = {};
        if (!cardHolder.trim())                                    errs.cardHolder = 'Cardholder name is required';
        if (cardNumber.replace(/\s/g, '').length !== 16)          errs.cardNumber = 'Enter a valid 16-digit card number';
        if (!/^\d{2}\/\d{2}$/.test(cardExpiry))                   errs.cardExpiry = 'Enter expiry as MM/YY';
        if (cardCVV.length < 3 || cardCVV.length > 4)             errs.cardCVV    = 'Enter a valid CVV (3–4 digits)';
        setCardErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handlePay = () => {
        if (!validateCard()) return;
        dispatch(payOrder({ orderid: payId, cardholderName: cardHolder, cardNumber, expiry: cardExpiry, cvv: cardCVV }))
            .then(() => { dispatch(getOrders({ email })); setPayModal(false); });
    };

    return (
        <>
            {/* Filter chips — traders only */}
            {userType === 'trader' && (
                <div className="td-filter-row">
                    {['', 'pending', 'accepted', 'in_transit', 'completed', 'cancelled'].map((s) => (
                        <button key={s}
                            className={`td-chip ${statusFilter === s ? 'active' : ''}`}
                            onClick={() => setFilter(s)}>
                            {s || 'All'}
                        </button>
                    ))}
                </div>
            )}

            <h3 style={{ color: '#e6edf3', fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                {userType === 'trader'
                    ? `Your Active Shipments`
                    : `Shipments Waiting for Drivers`}
            </h3>

            {displayOrders.length === 0 && (
                <div className="td-empty">
                    <div className="td-empty-icon">
                        {userType === 'trader' ? 'Order' : 'search'}
                    </div>
                    <p>
                        {userType === 'trader'
                            ? 'No orders yet. Post your first shipment above!'
                            : 'No available shipments at the moment.'}
                    </p>
                </div>
            )}

            {displayOrders.map((order) => (
                <div key={order._id} className="td-order-card">
                    <div className={`td-order-dot ${order.status}`}>
                        {STATUS_ICON[order.status] || <FaTruck />}
                    </div>

                    <div className="td-order-info">
                        <div className="td-order-route" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
                            #{order._id.slice(-6).toUpperCase()} &nbsp;
                            {order.pickupLocation} → {order.deliveryLocation}
                            {order.isUrgent && <span className="td-urgent">URGENT</span>}
                            {userType === 'trader' && order.driver?.[0] && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', marginLeft: '.25rem' }}>
                                    {order.driver[0].profilePic
                                        ? <img src={order.driver[0].profilePic} alt="driver"
                                            style={{ width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #f5a623' }}
                                            onError={(e) => { e.target.style.display = 'none'; }} />
                                        : <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#f5a623', color: '#0d1117', fontSize: '.65rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {order.driver[0].fullName?.[0]?.toUpperCase()}
                                          </span>
                                    }
                                    <span style={{ color: '#7d8590', fontSize: '.78rem' }}>{order.driver[0].fullName}</span>
                                </span>
                            )}
                        </div>
                        <div className="td-order-meta">
                            {VEHICLE_LABELS[order.vehicleType] || order.vehicleType} &nbsp;·&nbsp;
                            {order.weight} kg &nbsp;·&nbsp;
                            {order.distance} km &nbsp;·&nbsp;
                            OMR {order.estimatedFare?.toFixed(3)}
                            {order.trader?.[0] && userType === 'driver' && (
                                <> &nbsp;·&nbsp; {order.trader[0].fullName}</>
                            )}
                            {' '}· {moment(order.createdAt).fromNow()}
                        </div>
                    </div>

                    <div className="td-order-right">
                        <span className={`td-badge ${order.status}`}>{order.status.replace('_', ' ')}</span>

                        <div className="td-order-actions">
                            {/* Driver actions */}
                            {userType === 'driver' && order.status === 'pending' && (
                                <button className="td-btn-sm" onClick={() => handleAccept(order._id)}>
                                    Accept
                                </button>
                            )}
                            {userType === 'driver' && order.status === 'accepted' && (
                                <button className="td-btn-sm success" onClick={() => handleComplete(order._id)}>
                                    Complete
                                </button>
                            )}

                            {/* Track on Map button */}
                            {userType === 'trader' && ['accepted', 'in_transit'].includes(order.status) && (
                                <button className="td-btn-sm" style={{ background: '#1f6feb', color: '#fff' }}
                                    onClick={() => navigate(`/tracking?search=${order._id.slice(-8)}`)}>
                                    <FaMapMarkerAlt style={{ marginRight: '.25rem' }} /> Track
                                </button>
                            )}

                            {/* Trader actions */}
                            {userType === 'trader' && order.status === 'pending' && (
                                <>
                                    <button className="td-btn-sm muted" onClick={() => openEdit(order)}
                                        title="Edit" style={{ padding: '.3rem .6rem' }}>
                                        <CiEdit size={15} />
                                    </button>
                                    <button className="td-btn-sm danger" onClick={() => handleDel(order._id)}
                                        title="Delete" style={{ padding: '.3rem .6rem' }}>
                                        <MdDeleteOutline size={15} />
                                    </button>
                                </>
                            )}
                            {userType === 'trader' && order.status === 'accepted' && !order.isPaid && (
                                <button className="td-btn-sm success" onClick={() => openPay(order._id, order.estimatedFare)}>
                                    <FaCreditCard style={{ marginRight: '.25rem' }} />
                                    Pay OMR {order.estimatedFare?.toFixed(3)}
                                </button>
                            )}
                            {userType === 'trader' && ['pending', 'accepted'].includes(order.status) && (
                                <button className="td-btn-sm danger" onClick={() => handleCancel(order._id)}>
                                    Cancel
                                </button>
                            )}
                            {order.isPaid && (
                                <span className="td-paid">✓ Paid ({order.paymentMethod})</span>
                            )}
                        </div>
                    </div>
                </div>
            ))}

            {/* Edit Modal */}
            <Modal isOpen={modal} toggle={() => setModal(false)}>
                <ModalHeader toggle={() => setModal(false)}>Edit Order</ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label>Pickup Location</Label>
                        <Input value={editPickup} onChange={(e) => setEditPu(e.target.value)} />
                        {editErrors.pickupLocation && <p className="td-error">{editErrors.pickupLocation}</p>}
                    </FormGroup>
                    <FormGroup>
                        <Label>Delivery Location</Label>
                        <Input value={editDelivery} onChange={(e) => setEditDl(e.target.value)} />
                        {editErrors.deliveryLocation && <p className="td-error">{editErrors.deliveryLocation}</p>}
                    </FormGroup>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label>Distance (km)</Label>
                                <Input type="number" value={editDist} onChange={(e) => setEditDist(e.target.value)} />
                                {editErrors.distance && <p className="td-error">{editErrors.distance}</p>}
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label>Weight (kg)</Label>
                                <Input type="number" value={editWeight} onChange={(e) => setEditWt(e.target.value)} />
                                {editErrors.weight && <p className="td-error">{editErrors.weight}</p>}
                            </FormGroup>
                        </Col>
                    </Row>
                    <FormGroup>
                        <Label>Vehicle Type</Label>
                        <select className="form-control" value={editVehicle} onChange={(e) => setEditV(e.target.value)}>
                            <option value="">Select vehicle</option>
                            {Object.entries(VEHICLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        {editErrors.vehicleType && <p className="td-error">{editErrors.vehicleType}</p>}
                    </FormGroup>
                    <FormGroup>
                        <Label>Special Instructions</Label>
                        <Input type="textarea" value={editMsg} onChange={(e) => setEditMsg(e.target.value)} />
                    </FormGroup>
                    <FormGroup check>
                        <input type="checkbox" id="editUrgent" checked={editUrgent}
                            onChange={(e) => setEditUg(e.target.checked)}
                            style={{ accentColor: '#f5a623' }} />
                        <Label check htmlFor="editUrgent" style={{ color: '#f85149' }}> Urgent (+15%)</Label>
                    </FormGroup>
                </ModalBody>
                <ModalFooter>
                    <button className="td-btn-sm" onClick={handleUpdate}>Update</button>
                    <button className="td-btn-sm muted" onClick={() => setModal(false)}>Cancel</button>
                </ModalFooter>
            </Modal>

            {/* Payment Modal */}
            <Modal isOpen={payModal} toggle={() => setPayModal(false)}>
                <ModalHeader toggle={() => setPayModal(false)}>
                    Pay OMR {payAmt?.toFixed(3)} — Card Details
                </ModalHeader>
                <ModalBody>
                    <FormGroup>
                        <Label>Cardholder Name</Label>
                        <Input placeholder="Name on card" value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)} />
                        {cardErrors.cardHolder && <p className="td-error">{cardErrors.cardHolder}</p>}
                    </FormGroup>
                    <FormGroup>
                        <Label>Card Number</Label>
                        <Input placeholder="1234 5678 9012 3456" value={cardNumber}
                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} />
                        {cardErrors.cardNumber && <p className="td-error">{cardErrors.cardNumber}</p>}
                    </FormGroup>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label>Expiry Date</Label>
                                <Input placeholder="MM/YY" value={cardExpiry}
                                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))} />
                                {cardErrors.cardExpiry && <p className="td-error">{cardErrors.cardExpiry}</p>}
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label>CVV</Label>
                                <Input placeholder="•••" type="password" maxLength={4} value={cardCVV}
                                    onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))} />
                                {cardErrors.cardCVV && <p className="td-error">{cardErrors.cardCVV}</p>}
                            </FormGroup>
                        </Col>
                    </Row>
                </ModalBody>
                <ModalFooter>
                    <button className="td-btn-sm success" onClick={handlePay}>Complete Payment</button>
                    <button className="td-btn-sm muted" onClick={() => setPayModal(false)}>Cancel</button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default Orders;
