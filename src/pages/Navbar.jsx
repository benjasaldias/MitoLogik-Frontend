import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/troop_zeus_sprite.png';
import { userAuth } from './Authentication.jsx';

function Navbar() {
  const navigate = useNavigate();
  const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  return (
    
    <nav className="navbar">
      
      
      {!isLoggedIn ? (
        <>
          <button className="nav-button" onClick={() => navigate('/')}>
          <img src={logo} alt="Mitologik Logo" className="logo" />
          </button>
          <button className="nav-button" onClick={() => navigate('/about')}>Nosotros</button>
          <button className="nav-button" onClick={() => navigate('/register')}>Register</button>
          <button className="nav-button" onClick={() => navigate('/login')}>Login</button>
        </>
      ) : (
        <>
        
        <button className="nav-button" onClick={() => navigate('/')}>
          <img src={logo} alt="Mitologik Logo" className="logo" />
        </button>
        
        <button className="nav-button" onClick={() => navigate('/about')}>Nosotros</button>
        <button className="nav-button" onClick={() => navigate('/profile')}>Perfil</button>
        <button className="nav-button" onClick={() => navigate('/matches')}>Jugar</button>
        <button className="nav-button" onClick={() => navigate('/instructions')}>Instrucciones</button>
        <button className="nav-button" onClick={handleLogout}>Logout</button>
        </>
        

      )}
    </nav>
  );
}

export default Navbar;
