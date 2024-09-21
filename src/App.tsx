import { OpenCvProvider } from 'opencv-react';
import Landing from './landing/Landing';
import Navbar from './nav/Navbar';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import About from './nav/nav-components/About';
import Account from './nav/nav-components/Account';
import ImageUploader from './nav/nav-components/ImageUploader';
import './global.css';

function App() {
  return (
    <OpenCvProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/about' element={<About />} />
          <Route path='/account' element={<Account />} />
          <Route path='/upload' element={<ImageUploader />} />
        </Routes>
      </Router>
    </OpenCvProvider>
  );
}

export default App;
