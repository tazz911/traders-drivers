import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { getOrders, getAvailableOrders, delOrder, updOrder, acceptOrder, completeOrder, cancelOrder, payOrder } from '../features/OrderSlice';
import { Modal, ModalHeader, ModalBody, ModalFooter, FormGroup, Label, Input, Row, Col } from 'reactstrap';
import moment from 'moment';
import { MdDeleteOutline } from 'react-icons/md';
import { CiEdit } from 'react-icons/ci';
import { FaCheckCircle, FaTimes, FaCreditCard, FaTruck, FaSearch } from 'react-icons/fa';
import { MdLocalShipping } from 'react-icons/md';

const VEHICLE_LABELS = {
    bike: 'Bike', auto: 'Auto/Tuk-Tuk',
    truck_small: 'Small Truck', truck_medium: 'Medium Truck',
    truck_large: 'Large Truck', truck_xlarge: 'Extra Large Truck'
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
    const [statusFilter, setFilter]   = useState('');
    const [payModal,     setPayModal] = useState(false);
    const [payMethod,    setPayMethod]= useState('');
    const [payId,        setPayId]    = useState('');
    const [payAmt,       setPayAmt]   = useState(0);

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
    };

    const handleUpdate = () => {
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

    const openPay = (orderid, fare) => { setPayId(orderid); setPayAmt(fare); setPayModal(true); };
    const handlePay = () => {
        if (!payMethod) { alert('Select a payment method'); return; }
        dispatch(payOrder({ orderid: payId, paymentMethod: payMethod }))
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
                        {userType === 'trader' ? '📦' : '🔍'}
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
                        <div className="td-order-route">
                            #{order._id.slice(-6).toUpperCase()} &nbsp;
                            {order.pickupLocation} → {order.deliveryLocation}
                            {order.isUrgent && <span className="td-urgent">URGENT</span>}
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
                    <FormGroup><Label>Pickup Location</Label>
                        <Input value={editPickup} onChange={(e) => setEditPu(e.target.value)} /></FormGroup>
                    <FormGroup><Label>Delivery Location</Label>
                        <Input value={editDelivery} onChange={(e) => setEditDl(e.target.value)} /></FormGroup>
                    <Row>
                        <Col md={6}><FormGroup><Label>Distance (km)</Label>
                            <Input type="number" value={editDist} onChange={(e) => setEditDist(e.target.value)} /></FormGroup></Col>
                        <Col md={6}><FormGroup><Label>Weight (kg)</Label>
                            <Input type="number" value={editWeight} onChange={(e) => setEditWt(e.target.value)} /></FormGroup></Col>
                    </Row>
                    <FormGroup><Label>Vehicle Type</Label>
                        <select className="form-control" value={editVehicle} onChange={(e) => setEditV(e.target.value)}>
                            <option value="">Select vehicle</option>
                            {Object.entries(VEHICLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select></FormGroup>
                    <FormGroup><Label>Special Instructions</Label>
                        <Input type="textarea" value={editMsg} onChange={(e) => setEditMsg(e.target.value)} /></FormGroup>
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
                    Payment — OMR {payAmt?.toFixed(3)}
                </ModalHeader>
                <ModalBody>
                    <FormGroup><Label>Payment Method</Label>
                        <select className="form-control" value={payMethod} onChange={(e) => setPayMethod(e.target.value)}>
                            <option value="">Select method</option>
                            <option value="card">Credit / Debit Card</option>
                            <option value="upi">UPI</option>
                            <option value="netbanking">Net Banking</option>
                            <option value="cash">Cash on Delivery</option>
                        </select></FormGroup>
                    <FormGroup check>
                        <input type="checkbox" id="payAgree" required style={{ accentColor: '#f5a623' }} />
                        <Label check htmlFor="payAgree"> I agree to the payment terms</Label>
                    </FormGroup>
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
