import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import UserReducer from '../features/UserSlice';
import OrderReducer from '../features/OrderSlice';
import Register from '../components/Register';

const makeStore = () => configureStore({
    reducer: { user: UserReducer, order: OrderReducer },
    preloadedState: { user: { user: {}, message: "", isLoading: false, isSuccess: false, isError: false } }
});

const Wrap = () => (
    <Provider store={makeStore()}><MemoryRouter><Register /></MemoryRouter></Provider>
);

describe('Register Component', () => {
    it('renders the user type dropdown', () => {
        render(<Wrap />);
        expect(screen.getByTestId('usertype-select')).toBeInTheDocument();
    });

    it('shows driver fields when driver is selected', () => {
        render(<Wrap />);
        fireEvent.change(screen.getByTestId('usertype-select'), { target: { value: 'driver' } });
        expect(screen.getByText(/Driver Information/i)).toBeInTheDocument();
    });

    it('shows trader fields when trader is selected', () => {
        render(<Wrap />);
        fireEvent.change(screen.getByTestId('usertype-select'), { target: { value: 'trader' } });
        expect(screen.getByText(/Business Information/i)).toBeInTheDocument();
    });

    it('terms checkbox is unchecked by default', () => {
        render(<Wrap />);
        expect(screen.getByTestId('terms-checkbox')).not.toBeChecked();
    });
});
