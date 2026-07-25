import './Navbar.css';
import logo from '../assets/logo.svg';
import phoneIcon from '../assets/phone.svg';

function Navbar() {

  // Modificato qui: usa il protocollo dell'app per saltare la pagina di reindirizzamento web
  const openWhatsApp = () => {
    window.location.href = 'whatsapp://send?phone=393463365699';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="wrapper-navbar-logo">
          <div className="navbar-logo">
            <a href="/">
              <img src={logo} alt="Leggero Tours" className="navbar-logo-img" />.
            </a>
          </div>
        </div>

        <div className='wrapper-ul'>
          <div className="nav-menu" style={{ display: 'flex', gap: '8px' }}>
            <button className="nav-link" onClick={() => { window.location.href = '/special-events'; }}>Special Events</button>
            <button className="nav-link" onClick={() => { window.location.href = '/terms'; }}>Terms and Conditions</button>
            <button className="nav-link" onClick={() => { window.location.href = '/private-transfer'; }}>Private Transfer</button>
            <button className="nav-link" onClick={() => { window.location.href = '/menu'; }}>Menu</button>
            <button className="nav-link" onClick={() => { window.location.href = '/reviews'; }}>Reviews</button>
            <button className="nav-link" onClick={() => { window.location.href = '/departures'; }}>Departures</button>
            <button className="nav-link" onClick={() => { window.location.href = '/about'; }}>About us</button>
          </div>
        </div>
        
        <div className='wrapper-btn' style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button className="nav-link nav-booking" onClick={openWhatsApp} style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', width: 'fit-content', height: '40px' }}>
            WhatsApp Us
            <img src={phoneIcon} alt="WhatsApp" style={{ width: '16px', height: '16px' }} />
            <span 
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '45px',
                width: '10px',
                height: '10px',
                backgroundColor: '#25D366', // Verde classico di WhatsApp
                borderRadius: '50%',
                border: '1.5px solid white' // Bordino per staccarlo dallo sfondo del bottone
              }}
            />
          </button>
          
          {/* <button className="nav-link nav-booking" onClick={() => { window.location.href = '/book'; }}>Check Availability</button> */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;