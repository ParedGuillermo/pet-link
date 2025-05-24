import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabase';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PetRegistration from './components/pets/PetRegistrationForm';
import Login from './components/auth/Login';
import SignUp from './components/auth/SignUp';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-pet-cream">
          {/* Aquí iría tu Navbar si lo tienes */}
          
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Rutas privadas */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />

            <Route path="/register-pet" element={
              <PrivateRoute>
                <PetRegistration />
              </PrivateRoute>
            } />

            {/* Ruta de fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          {/* Aquí iría tu Footer si lo tienes */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;