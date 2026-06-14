import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <NavLink to="/" className="navbar-brand">
                    <div className="navbar-brand-icon">A</div>
                    <div className="navbar-brand-text">Researcher<span>Assist</span></div>
                </NavLink>

                <div className="navbar-links">
                    <NavLink to="/" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`} end>
                        Home
                    </NavLink>
                    <NavLink to="/history" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                        History
                    </NavLink>
                    <NavLink to="/settings" className={({ isActive }) => `navbar-link ${isActive ? 'active' : ''}`}>
                        Settings
                    </NavLink>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
