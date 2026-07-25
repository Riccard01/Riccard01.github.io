import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Book from './pages/Book';
import './App.css';

function App() {
  return (
    <>
      {/* Completely independent blocking screen */}
      {/* <div id="desktop-blocker">
        <div className="blocker-content">
          <h1 className="blocker-title">Mobile view required</h1>
          <p className="blocker-desc">
            For a better and smoother navigation experience, this platform is optimized exclusively for handheld devices.
          </p>
          <span className="blocker-action">Please press F12 to continue.</span>
        </div>
      </div> */}

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/book" element={<Book />} />
      </Routes>
    </>
  );
}

export default App;