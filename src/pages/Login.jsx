import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAuth } from './Authentication.jsx';
import "./Register.css" // ocupa el mismo css de Register
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = userAuth()
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        
        const data = await res.json();
        // AQUI SE GUARDA EL TOKEN Y/O USER ID
        localStorage.setItem('token', data.token); 
        localStorage.setItem('user', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          username: data.user.username
        }));
        console.log('DATA:', data);
        console.log('data.user.id:', data.user.id);

        login({
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          password: data.user.passwords
        })

        // alert('Inicio de sesión exitoso');
        navigate('/');
      } else {
        const err = await res.json();
        alert('Error: ' + (err.message || 'Credenciales incorrectas'));
      }
    } catch (error) {
      alert('Error de red' + error.message);
    }
  };


  return (
    <div className="home-container">
      <main className="register-main">
    <form onSubmit={handleSubmit}>
      <h2>Iniciar sesión</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      /><br />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      /><br />
      <button type="submit">Ingresar</button>
    </form>
    </main>
    </div>
  );
}

export default Login;
