import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Orders from './components/Orders';
import Tracking from './components/Tracking';
import Admin from './components/Admin';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"          element={<LandingPage />} />
                <Route path="/login"     element={<Login />} />
                <Route path="/register"  element={<Register />} />
                <Route path="/home"      element={<Home />} />
                <Route path="/orders"    element={<Orders />} />
                <Route path="/tracking"  element={<Tracking />} />
                <Route path="/admin"     element={<Admin />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
