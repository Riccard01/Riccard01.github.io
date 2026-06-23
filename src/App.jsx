 import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Book from './pages/Book';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book" element={<Book />} />
    </Routes>
  );
}

export default App;
