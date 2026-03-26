import { OpenCvProvider } from 'opencv-react';
import Landing from './landing/Landing';
import Navbar from './nav/Navbar';
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import About from './nav/nav-components/about/About';
import Account from './nav/nav-components/Account';
import ImageUploader from './nav/nav-components/ImageUploader';
import './global.css';
import Lenis from 'lenis';
import SignUp from './nav/nav-components/signUp/SignUp';
import SignIn from './nav/nav-components/signIn/SignIn';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const lenis = new Lenis();

  function raf(time: number) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);
  return (
    <OpenCvProvider>
      <Router>
        <Navbar />
        <ToastContainer position='top-right' autoClose={5000} />
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/about' element={<About />} />
          <Route path='/about/*' element={<About />} />
          <Route path='/account' element={<Account />} />
          <Route path='/upload' element={<ImageUploader />} />
          <Route path='/auth/signup' element={<SignUp />} />
          <Route path='/auth/signin' element={<SignIn />} />
        </Routes>
      </Router>
    </OpenCvProvider>
  );
}

export default App;
