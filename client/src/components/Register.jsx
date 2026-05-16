import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { RegisterValidation } from '../validations/RegisterValidation';
import { addUser } from '../features/UserSlice';
import Header from './Header';
import Footer from './Footer';
import { FaUserPlus } from 'react-icons/fa';

const Register = () => {
    const [fullName,  setFullName]  = useState('');
    const [email,     setEmail]     = useState('');
    const [password,  setPassword]  = useState('');
    const [phone,     setPhone]     = useState('');
    const [userType,  setUserType]  = useState('');
    // Driver fields
    const [licenseNumber, setLicense]  = useState('');
    const [vehicleType,   setVehicle]  = useState('');
    const [baseRate,      setBaseRate] = useState('');
    // Trader fields
    const [companyName,          setCompany]  = useState('');
    const [registrationNumber,   setRegNum]   = useState('');
    const [businessCategory,     setBizCat]   = useState('');

    const dispatch = useDispatch();
    const message  = useSelector((s) => s.user.message);

    const { register, handleSubmit, formState: { errors } } =
        useForm({ resolver: yupResolver(RegisterValidation) });

    const onSubmit = () => {
        const udata = {
            fullName, email, password, phone, userType,
            ...(userType === 'driver' && { licenseNumber, vehicleType, baseRate }),
            ...(userType === 'trader' && { companyName, registrationNumber, businessCategory })
        };
        dispatch(addUser(udata));
    };

    return (
        <div className="td-auth-page">
            <Header />
            <div className="td-auth-center">
                <div className="td-auth-card td-auth-card-wide">
                    <div className="td-auth-icon"><FaUserPlus /></div>
                    <h2>Create Account</h2>
                    <p className="sub">Join the network today</p>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Full Name */}
                        <div className="td-input-group">
                            <label>Full Name</label>
                            <input className="td-input" type="text" placeholder="Mohammed al-Salmi"
                                {...register('fullName', { onChange: (e) => setFullName(e.target.value) })} />
                            {errors.fullName && <p className="td-error">{errors.fullName.message}</p>}
                        </div>

                        <div className="td-input-group">
                            <label>Email</label>
                            <input className="td-input" type="email" placeholder="you@example.com"
                                {...register('email', { onChange: (e) => setEmail(e.target.value) })} />
                            {errors.email && <p className="td-error">{errors.email.message}</p>}
                        </div>

                        <div className="td-input-group">
                            <label>Phone</label>
                            <input className="td-input" type="tel" placeholder="+968"
                                {...register('phone', { onChange: (e) => setPhone(e.target.value) })} />
                            {errors.phone && <p className="td-error">{errors.phone.message}</p>}
                        </div>

                        <div className="td-input-group">
                            <label>Password</label>
                            <input className="td-input" type="password" placeholder="Min 8 digts"
                                {...register('password', { onChange: (e) => setPassword(e.target.value) })} />
                            {errors.password && <p className="td-error">{errors.password.message}</p>}
                        </div>

                        <div className="td-input-group">
                            <label>Confirm Password</label>
                            <input className="td-input" type="password" 
                                {...register('confirmPassword')} />
                            {errors.confirmPassword && <p className="td-error">{errors.confirmPassword.message}</p>}
                        </div>

                        <div className="td-input-group">
                            <label>I am a</label>
                            <select className="td-input" data-testid="usertype-select"
                                {...register('userType', { onChange: (e) => setUserType(e.target.value) })}>
                                <option value="">Select user type</option>
                                <option value="trader">Trader</option>
                                <option value="driver">Driver</option>
                            </select>
                            {errors.userType && <p className="td-error">{errors.userType.message}</p>}
                        </div>

                        {/* Driver extra fields */}
                        {userType === 'driver' && (
                            <div className="td-extra-fields">
                                <h6>Driver Information</h6>
                                <div className="td-input-group">
                                    <label>License Number</label>
                                    <input className="td-input" placeholder="OM-DL-XXXXXX"
                                        onChange={(e) => setLicense(e.target.value)} />
                                </div>
                                <div className="td-input-row">
                                    <div className="td-input-group">
                                        <label>Vehicle Type</label>
                                        <select className="td-input" onChange={(e) => setVehicle(e.target.value)}>
                                            <option value="">Select vehicle</option>
                                            <option value="bike">Bike</option>
                                            <option value="truck_small">Small Truck (up to 2T)</option>
                                            <option value="truck_medium">Medium Truck (2–5T)</option>
                                            <option value="truck_large">Large Truck (5–10T)</option>
                                            <option value="truck_xlarge">Extra Large Truck (10T+)</option>
                                        </select>
                                    </div>
                                    <div className="td-input-group">
                                        <label>Base Rate/Km (OMR)</label>
                                        <input className="td-input" type="number" placeholder="0.350"
                                            step="0.001" min="0" onChange={(e) => setBaseRate(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Trader extra fields */}
                        {userType === 'trader' && (
                            <div className="td-extra-fields">
                                <h6>Business Information</h6>
                                <div className="td-input-group">
                                    <label>Company / Business Name</label>
                                    <input className="td-input" placeholder="Your Company"
                                        onChange={(e) => setCompany(e.target.value)} />
                                </div>
                                <div className="td-input-row">
                                    <div className="td-input-group">
                                        <label>Reg. Number</label>
                                        <input className="td-input" placeholder="OM-2024-XXX"
                                            onChange={(e) => setRegNum(e.target.value)} />
                                    </div>
                                    <div className="td-input-group">
                                        <label>Business Category</label>
                                        <select className="td-input" onChange={(e) => setBizCat(e.target.value)}>
                                            <option value="">Select</option>
                                            <option value="Cloths">Cloths</option>
                                            <option value="Food">Food</option>
                                            <option value="Equipment">Equipment</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="td-input-group" style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <input type="checkbox" id="terms" required data-testid="terms-checkbox"
                                style={{ width: 'auto', accentColor: '#f5a623' }} />
                            <label htmlFor="terms" style={{ margin: 0, fontSize: '.8rem', color: '#7d8590', cursor: 'pointer' }}>
                                I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                            </label>
                        </div>

                        <button className="td-btn-full" type="submit">Create Account</button>

                        {message && (
                            <p className={message === 'User Registered' ? 'td-msg-success' : 'td-msg-error'}>
                                {message}
                            </p>
                        )}
                    </form>

                    <p className="td-auth-link">
                        Already have an account? <Link to="/login">Sign In</Link>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Register;
