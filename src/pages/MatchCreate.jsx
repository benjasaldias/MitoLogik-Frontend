import { useReducer, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAuth } from './Authentication';
import "./Register.css" // ocupa el mismo css de Register

function MatchCreate() {
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [godId, setGodId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: name,
          god_id: parseInt(godId)
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'No se pudo crear la partida');
      }

      const data = await res.json();
      alert('Partida creada exitosamente');
      navigate(`/matches/${data.match.id}/lobby`);
    } catch (err) {
      alert('Error al crear la partida: ' + err.message);
    }
  };

  return (
    <div className="home-container">
      <main className="register-main">
        <form onSubmit={handleSubmit}>
          <h2>Crear nueva partida</h2>

          <input
            type="text"
            placeholder="Nombre de la partida"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          /><br />

          <input
            type="number"
            placeholder="ID del dios"
            value={godId}
            onChange={(e) => setGodId(e.target.value)}
            required
          /><br />

          <button type="submit">Crear</button>
        </form>
      </main>
    </div>
  );
}

export default MatchCreate;
