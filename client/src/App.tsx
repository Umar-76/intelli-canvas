import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/authContext';
import ProtectedRoute from './components/protectedRoute';
import BoardPage from './pages/BoardPage';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import Navbar from './components/Navbar';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>

      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<HomePage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/board/:boardId" element={<BoardPage />} />
          </Route>
        </Routes>
        <ToastContainer position="bottom-right" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;