import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoginValidation } from '../validations/LoginValidation';
import { login } from '../features/UserSlice';
import Header from './Header';
import Footer from './Footer';
import { FaSignInAlt } from 'react-icons/fa';

const Login = () => {
    const [email,    setEmail]    = useState('');
    const [password, setPassword] = useState('');
    const dispatch   = useDispatch();
    const message    = useSelector((s) => s.user.message);
    const isSuccess  = useSelector((s) => s.user.isSuccess);
    const isLoading  = useSelector((s) => s.user.isLoading);
    const navigate   = useNavigate();

    const { register, handleSubmit: submitForm, formState: { errors } } =
        useForm({ resolver: yupResolver(LoginValidation) });

    const handleSubmit = () => dispatch(login({ email, password }));

    useEffect(() => {
        if (message === 'success' && isSuccess) navigate('/home');
    }, [message, isSuccess]);

    return (
        <div className="td-auth-page">
            <Header />
            <div className="td-auth-center">
                <div className="td-auth-card">
                    

                    <div className="td-auth-icon"><FaSignInAlt /></div>
                    <h2>Welcome Back</h2>
                    <p className="sub">Sign in to your account</p>

                    {message && message !== 'success' && (
                        <p className="td-msg-error">{message}</p>
                    )}

                    <div className="td-input-group">
                        <label>Email</label>
                        <input
                            className="td-input"
                            type="email"
                            placeholder="you@example.com"
                            data-testid="email-input"
                            {...register('email', { onChange: (e) => setEmail(e.target.value) })}
                        />
                        {errors.email && <p className="td-error">{errors.email.message}</p>}
                    </div>

                    <div className="td-input-group">
                        <label>Password</label>
                        <input
                            className="td-input"
                            type="password"
                            placeholder="••••••••"
                            data-testid="password-input"
                            {...register('password', { onChange: (e) => setPassword(e.target.value) })}
                        />
                        {errors.password && <p className="td-error">{errors.password.message}</p>}
                    </div>

                    <button
                        className="td-btn-full"
                        data-testid="login-button"
                        disabled={isLoading}
                        onClick={submitForm(handleSubmit)}
                        style={{ opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>

                    <p className="td-auth-link">
                        Don't have an account? <Link to="/register">Register</Link>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Login;
