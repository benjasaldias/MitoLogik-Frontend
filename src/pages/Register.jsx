import { useState } from 'react';
import './Register.css';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePic, setProfilePic] = useState('');


  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        profile_pic: profilePic
      })
    });

    if (res.ok) {
      alert('Usuario registrado con éxito');
    } else {
      const err = await res.json();
      alert('Error: ' + (err.error || 'Registro fallido'));
    }


  };

  

  return (
    <div className="home-container">
      <main className="register-main">
    <form onSubmit={handleSubmit}>
      <h2>Registro</h2>
      <input
        type="text"
        placeholder="Nombre de usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      /><br />
      <input
        type="email"
        placeholder="Email"
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
      {/* <input
        type="text"
        placeholder="URL de foto de perfil"
        value={profilePic}
        onChange={(e) => setProfilePic(e.target.value)}
      /><br /> */}
      <button type="submit">Registrarse</button>
    </form>
  </main>
  </div>
  );
}

export default Register;
