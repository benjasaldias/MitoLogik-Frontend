import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Matches.css'; // Vamos a crear este archivo después

function Matches() {
  const [matches, setMatches] = useState([]);
  const [userMatches, setUserMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        // Obtener todas las partidas disponibles
        const res = await fetch(`${import.meta.env.VITE_API_URL}/matches`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!res.ok) throw new Error('No se pudo obtener las partidas');
        const data = await res.json();
        
        // Obtener el ID del usuario actual
        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData?.id;

        if (userId) {
          // Filtrar las partidas donde el usuario es participante
          const myMatches = data.filter(match => 
            match.Players?.some(player => player.user_id === userId)
          );
          setUserMatches(myMatches);
          
          // Filtrar las partidas donde el usuario no es participante
          const otherMatches = data.filter(match => 
            !match.Players?.some(player => player.user_id === userId)
          );
          setMatches(otherMatches);
        } else {
          setMatches(data);
        }
      } catch (err) {
        alert('Error cargando partidas: ' + err.message);
      }
    };

    fetchMatches();
  }, []);

  const handleJoin = async (matchId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${matchId}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ 
          god_id: 8 // Aquí hay que editar despues para que el usuario pueda elegir su dios
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'No se pudo unir a la partida');
      }

      alert('Te uniste exitosamente a la partida');
      navigate(`/matches/${matchId}/lobby`);
    } catch (error) {
      alert('Error al unirse: ' + error.message);
    }
  };

  return (
    <div className="matches-container">
      <div className="matches-panels">
        <div className="matches-panel">
          <h2>Mis Partidas</h2>
          {userMatches.length === 0 ? (
            <p>No estás participando en ninguna partida.</p>
          ) : (
            <ul className="matches-list">
              {userMatches
              .filter(match => match.state !== 2 && match.state !== 2) // no mostrar las terminadas
              .map(match => (
                <li key={match.id} className="match-item">
                  <div className="match-info">
                    <h3>{match.name}</h3>
                    <p>Jugadores: {match.Players?.length ?? 0}/2</p>
                    <p>Estado: {match.state === 0 ? 'Esperando' : 'En curso'}</p>
                  </div>
                  <button 
                    className="match-button"
                    onClick={() => {
                      // Debug: Verificar el tipo y valor de match.state
                      console.log('Match state:', match.state);
                      console.log('Match state type:', typeof match.state);
                      console.log('Match object:', match);
                      
                      // Match state puede ser string en lugar de número
                      // Comparamos como string para evitar problemas de tipo
                      const isWaiting = match.state === 0 || match.state === '0';
                      const isFinished = match.state === 2 || match.state === '2';
                      
                      // Determinar la ruta adecuada según el estado
                      let destination;
                      if (isWaiting) {
                        destination = `/matches/${match.id}/lobby`; // Lobby para partidas no iniciadas
                      } else if (isFinished) {
                        destination = `/matches/${match.id}/gameover`; // GameOver para partidas finalizadas
                      } else {
                        destination = `/matches/${match.id}`; // Vista de juego para partidas en curso
                      }
                      
                      console.log('Navigating to:', destination);
                      navigate(destination);
                    }}
                  >
                    {match.state === 0 || match.state === '0' 
                      ? 'Ir al Lobby' 
                      : (match.state === 2 || match.state === '2'
                         ? 'Ver resultado'
                         : 'Ver partida')
                    }
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="matches-panel">
          <h2>Partidas disponibles</h2>
          
          <button 
            className="create-match-button" 
            onClick={() => navigate('/create-match')}
          >
            Crear partida
          </button>

          {matches.length === 0 ? (
            <p>No hay partidas disponibles por ahora.</p>
          ) : (
            <ul className="matches-list">
              {matches
                .filter(match => (match.Players?.length ?? 0) < 2)
                .map(match => (
                  <li key={match.id} className="match-item">
                    <div className="match-info">
                      <h3>{match.name}</h3>
                      <p>Jugadores: {match.Players?.length ?? 0}/2</p>
                    </div>
                    <button 
                      className="match-button"
                      onClick={() => handleJoin(match.id)}
                    >
                      Unirse
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Matches;
