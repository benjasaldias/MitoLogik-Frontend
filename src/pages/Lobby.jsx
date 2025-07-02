import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GodSelector from './GodSelector';
import './Lobby.css';

function Lobby() {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  // Obtener y parsear el objeto de usuario desde localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Logs para depuración - ayudan a identificar problemas con los IDs
  useEffect(() => {
    if (match) {
      console.log("ID del usuario actual:", user.id);
      console.log("ID del host de la partida:", match.host_user_id);
      console.log("¿Es el usuario el host?:", user.id === match.host_user_id);
    }
  }, [match, user.id]);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        console.log("Obteniendo información de la partida:", id);
        
        const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Accept': 'application/json'
          }
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error("Error en la respuesta:", errorText);
          throw new Error('No se pudo cargar la partida');
        }

        const data = await res.json();
        console.log("Datos de partida recibidos:", data);
        
        // Si la partida ya está en curso, redirigir a la vista de juego
        if (data.state === 1 || data.state === '1') {
          console.log("La partida ya está en curso, redirigiendo a la vista de juego");
          navigate(`/matches/${id}`);
          return;
        }
        
        setMatch(data);
        setPlayers(data.Players || []);
      } catch (err) {
        console.error("Error al cargar la partida:", err);
        alert(err.message);
      }
    };

    fetchMatch();
  }, [id]);

  const handleStart = async () => {
    try {
      // Log para debug
      console.log('Iniciando partida con ID:', id);
      console.log('Token:', localStorage.getItem('token'));
      
      // Verificar que los jugadores estén listos antes de iniciar
      if (players.length < 2) {
        alert('Se necesitan al menos 2 jugadores para iniciar la partida');
        return;
      }
      
      // Intentar iniciar la partida
      const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ match_id: id }) // Añadir explícitamente el ID de la partida
      });

      // Verificar respuesta
      if (!res.ok) {
        let errorMessage;
        try {
          const errData = await res.json();
          errorMessage = errData.message || 'Error al iniciar la partida';
          console.error('Error detallado:', errData);
        } catch (parseError) {
          errorMessage = `Error de servidor (${res.status}): ${res.statusText}`;
        }
        throw new Error(errorMessage);
      }

      // Éxito
      alert('¡Partida iniciada exitosamente!');
      
      // Redirigir a la vista de juego
      navigate(`/matches/${id}`);
    } catch (err) {
      console.error('Error completo:', err);
      alert(`Error al iniciar la partida: ${err.message}`);
    }
  };

  // Obtener el ID del usuario actual desde localStorage
  const currentUserId = user?.id;
  
  // Buscar el jugador asociado al usuario actual
  const userPlayer = players.find(p => p.user_id === currentUserId);
  
  // Logs para debug
  useEffect(() => {
    if (players.length > 0) {
      console.log("Jugadores en lobby:", players);
      console.log("ID del usuario actual:", currentUserId);
      console.log("Jugador del usuario actual:", userPlayer);
    }
  }, [players, currentUserId, userPlayer]);

  const handleGodSelection = async (newGodId) => {
    if (!userPlayer) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/players/${userPlayer.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ god_id: newGodId })
      });

      if (!res.ok) throw new Error('No se pudo actualizar el dios');

      // alert('Dios actualizado exitosamente');

      // Refrescar los jugadores
      const updated = await fetch(`${import.meta.env.VITE_API_URL}/matches/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      const updatedData = await updated.json();
      setPlayers(updatedData.Players || []);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!match) return <p>Cargando partida...</p>;

  return (
    <div className="home-container">
      <main className="register-main">
        <h2>Lobby de Partida: {match.name}</h2>
        <p><strong>ID:</strong> {match.id}</p>
        <p><strong>Estado:</strong> {match.state === 0 ? 'Esperando jugadores' : 'En curso o finalizada'}</p>

        <h3>Jugadores</h3>
        <ul>
          {players.map((p) => (
            <li key={p.id}>
              {p.username || `Jugador ${p.id}`} — Dios ID: {p.god_id ?? 'No seleccionado'}
            </li>
          ))}
        </ul>

        {/* Mostrar selector de dios si el jugador está en la partida y el match no ha empezado */}
        {userPlayer && match.state === 0 && (
          <GodSelector
            currentGodId={userPlayer.god_id}
            onSelect={handleGodSelection}
          />
        )}

        {/* Información sobre quién puede iniciar la partida, y el botón */}
        {match.state === 0 && (
        <div className="host-info">
          <p>
            {user && user.id === match.host_user_id 
              ? "Eres el anfitrión de esta partida" 
              : `El anfitrión de esta partida es: ${match.host_username || "ID: " + match.host_user_id}`}
          </p>
          {user && user.id === match.host_user_id && (
            <button 
              className="start-game-button" 
              onClick={handleStart}
              disabled={players.length < 2}
            >
              {players.length < 2 ? "Esperando más jugadores..." : "Iniciar partida"}
            </button>
          )}
        </div>
      )}

      </main>
    </div>
  );
}

export default Lobby;
