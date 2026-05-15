import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import UserReducer from '../features/UserSlice';
import OrderReducer from '../features/OrderSlice';
import Header from '../components/Header';

const makeStore = (user = null) => configureStore({
    reducer: { user: UserReducer, order: OrderReducer },
    preloadedState: {
        user: { user: user || {}, message: "", isLoading: false, isSuccess: false, isError: false },
        order: { orders: [], availableOrders: [], message: "", status: "idle", isLoading: false, isSuccess: false, isError: false }
    }
});

const Wrap = ({ user }) => (
    <Provider store={makeStore(user)}>
        <MemoryRouter initialEntries={['/home']}>
            <Routes><Route path="*" element={<Header />} /></Routes>
        </MemoryRouter>
    </Provider>
);

describe('Header / Navbar Component', () => {
    it('renders search input', () => {
        render(<Wrap user={{ fullName: 'Ahmed Ali', userType: 'trader' }} />);
        expect(screen.getByTestId('navbar-search')).toBeInTheDocument();
    });

    it('updates search value on typing', () => {
        render(<Wrap user={{ fullName: 'Ahmed Ali', userType: 'trader' }} />);
        const input = screen.getByTestId('navbar-search');
        fireEvent.change(input, { target: { value: 'ABC12345' } });
        expect(input.value).toBe('ABC12345');
    });

    it('shows user first name in navbar', () => {
        render(<Wrap user={{ fullName: 'Sara Al-Balushi', userType: 'trader' }} />);
        expect(screen.getByText(/Sara/i)).toBeInTheDocument();
    });

    it('shows trader icon for trader user', () => {
        render(<Wrap user={{ fullName: 'Ahmed Ali', userType: 'trader' }} />);
        expect(screen.getByText(/🏪/)).toBeInTheDocument();
    });
});
