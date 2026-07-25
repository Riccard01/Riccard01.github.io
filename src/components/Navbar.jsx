import React from 'react';
import './Navbar.css';
import phoneIcon from '../assets/phone.svg';

function Navbar() {
  const openWhatsApp = () => {
    window.location.href = 'whatsapp://send?phone=393463365699';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="wrapper-btn">
          <button className="nav-whatsapp" onClick={openWhatsApp}>
            <span className="online-indicator" />
            WhatsApp Us
            <img src={phoneIcon} alt="WhatsApp" className="whatsapp-icon" />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;