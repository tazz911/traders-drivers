import 'bootstrap/dist/css/bootstrap.min.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux';
import { store } from './store.js';
import { setUser } from './features/UserSlice.js';

// Restore auth state on app load
const user = localStorage.getItem('user');
if (user) {
    try {
        store.dispatch(setUser(JSON.parse(user)));
    } catch (error) {
        console.error('Failed to restore auth state:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
    }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
)
