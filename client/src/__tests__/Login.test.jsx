import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import UserReducer from '../features/UserSlice';
import OrderReducer from '../features/OrderSlice';
import Login from '../components/Login';

const makeStore = (auth = {}) => configureStore({
    reducer: { user: UserReducer, order: OrderReducer },
    preloadedState: { user: { user: {}, message: "", isLoading: false, isSuccess: false, isError: false, ...auth } }
});

const Wrap = ({ store }) => (
    <Provider store={store}><MemoryRouter><Login /></MemoryRouter></Provider>
);

describe('Login Component', () => {
    it('renders email and password inputs', () => {
        render(<Wrap store={makeStore()} />);
        expect(screen.getByTestId('email-input')).toBeInTheDocument();
        expect(screen.getByTestId('password-input')).toBeInTheDocument();
    });

    it('renders Sign In button', () => {
        render(<Wrap store={makeStore()} />);
        expect(screen.getByTestId('login-button')).toBeInTheDocument();
    });

    it('updates email field on user input', () => {
        render(<Wrap store={makeStore()} />);
        const emailInput = screen.getByTestId('email-input');
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        expect(emailInput.value).toBe('test@example.com');
    });

    it('shows error message when credentials are invalid', () => {
        render(<Wrap store={makeStore({ message: "Invalid Credentials", isSuccess: false })} />);
        expect(screen.getByText('Invalid Credentials')).toBeInTheDocument();
    });
});
