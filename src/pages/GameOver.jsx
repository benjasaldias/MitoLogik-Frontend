import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './GameOver.css';

function GameOver() {
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [winner, setWinner] = useState(null);
  const [loser, setLoser] = useState(null);
  const { matchId } = useParams();
  const navigate = useNavigate();
  
  // Función para obtener los datos de la partida
  const fetchMatchResult = async () => {
    if (!matchId) {
      console.error('No hay ID de partida válido para obtener resultados');
      return;
    }

    console.log('Cargando datos de la partida ID:', matchId);
    
    try {
        // Obtener los detalles de la partida
        const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${matchId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!res.ok) throw new Error('No se pudo obtener los detalles de la partida');
        const matchData = await res.json();
        
        setMatch(matchData);

        // Verificar que la partida realmente haya terminado
        if (matchData.state !== 2) {
          console.log('La partida no ha terminado, redirigiendo...');
          navigate(`/matches/${matchId}`);
          return;
        }

        // Encontrar el ganador y el perdedor
        const winnerId = matchData.winner_id;
        const players = matchData.Players || [];
        
        if (players.length === 0) {
          throw new Error('No se encontraron jugadores en la partida');
        }

        const winnerPlayer = players.find(player => player.id === winnerId);
        const loserPlayer = players.find(player => player.id !== winnerId);
        console.log('Ganador:', winnerPlayer, 'Perdedor:', loserPlayer);
        
        // Inicializar con valores predeterminados
        let winnerUsername = 'Jugador 1';
        let loserUsername = 'Jugador 2';
        let winnerGodName = 'Desconocido';
        let loserGodName = 'Desconocido';
        
        // Asignar nombres de dioses si tenemos esa información
        if (winnerPlayer && winnerPlayer.god_id) {
          winnerGodName = getGodName(winnerPlayer.god_id);
        }
        
        if (loserPlayer && loserPlayer.god_id) {
          loserGodName = getGodName(loserPlayer.god_id);
        }
        
        // Obtener nombres de usuario directamente de la API
        try {
          console.log('Obteniendo nombre del ganador, ID de usuario:', winnerPlayer.user_id);
          const winnerRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${winnerPlayer.user_id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (winnerRes.ok) {
            const winnerData = await winnerRes.json();
            console.log('Datos del ganador:', winnerData);
            
            // Extraer el nombre de usuario desde la estructura anidada
            if (winnerData && winnerData.user && winnerData.user.username) {
              winnerUsername = winnerData.user.username;
              console.log('Nombre del ganador encontrado:', winnerUsername);
            } else if (winnerData && winnerData.username) {
              winnerUsername = winnerData.username;
              console.log('Nombre del ganador encontrado (directamente):', winnerUsername);
            }
             const nuevosWins = winnerData.user.games_won + 1;
             const updateRes = await fetch(`${import.meta.env.VITE_API_URL}/profile/${winnerPlayer.user_id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                  user_id:  winnerPlayer.user_id,
                  avatar: winnerPlayer.profilePic,
                  games_won: nuevosWins
                 })
            });

            if (updateRes.ok) {
              console.log('Se actualizaron Juegos ganados');
            } else {
              console.error('Error de Servidor: No se pudieron actualizar juegos ganados');
            }


          }
        } catch (err) {
          console.error('Error al obtener el nombre del ganador:', err);
        }
        
        try {
          console.log('Obteniendo nombre del perdedor, ID de usuario:', loserPlayer.user_id);
          const loserRes = await fetch(`${import.meta.env.VITE_API_URL}/users/${loserPlayer.user_id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (loserRes.ok) {
            const loserData = await loserRes.json();
            console.log('Datos del perdedor:', loserData);
            
            // Extraer el nombre de usuario desde la estructura anidada
            if (loserData && loserData.user && loserData.user.username) {
              loserUsername = loserData.user.username;
              console.log('Nombre del perdedor encontrado:', loserUsername);
            } else if (loserData && loserData.username) {
              loserUsername = loserData.username;
              console.log('Nombre del perdedor encontrado (directamente):', loserUsername);
            }
          }
        } catch (err) {
          console.error('Error al obtener el nombre del perdedor:', err);
        }
        
        // Almacenar la información en el estado para usarla en la interfaz
        setWinner({
          ...winnerPlayer,
          username: winnerUsername,
          godName: winnerGodName
        });
        
        setLoser({
          ...loserPlayer,
          username: loserUsername,
          godName: loserGodName
        });
        
        // No podemos acceder a los valores actualizados de winner/loser aquí,
        // así que solo mostraremos las variables directas
        console.log('Datos finales antes de completar la carga:');
        console.log('- Nombre del ganador:', winnerUsername);
        console.log('- Nombre del perdedor:', loserUsername);
        
        // Finalizar la carga
        setLoading(false);
      } catch (err) {
        console.error('Error cargando resultado de la partida:', err);
        setLoading(false);
      }
  };

  useEffect(() => {
    // Verificar que tenemos un matchId válido
    if (!matchId) {
      console.error('No se proporcionó un ID de partida válido');
      return;
    }
    
    console.log('Iniciando carga de datos para la partida ID:', matchId);
    
    fetchMatchResult();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, navigate]);

  // Función para obtener el nombre del dios según su ID
  const getGodName = (godId) => {
    const gods = {
      1: 'Zeus',
      2: 'Hades',
      3: 'Poseidón',
      4: 'Ares',
      5: 'Apolo',
      6: 'Hermes',
    };
    return gods[godId] || 'Desconocido';
  };

  const handleBackToMatches = () => {
    navigate('/matches');
  };

  if (loading) {
    return <div className="game-over-container loading">Cargando resultado...</div>;
  }

  // Depurar estados antes del renderizado final
  console.log("DEBUG - Estados antes del renderizado:");
  console.log("Winner:", winner);
  console.log("Loser:", loser);

  // Extraer directamente los nombres de los objetos de estado
  // Sin condicionales complejos ni verificaciones adicionales
  const winnerName = winner?.username || 'Ganador';
  const loserName = loser?.username || 'Perdedor';
  
  console.log('Nombres de usuario que se mostrarán:', { winnerName, loserName });

  return (
    <div className="game-over-container">
      <h1>¡Fin de la partida!</h1>
      <div className="game-result">
        <div className="winner-section">
          <h2>¡Victoria para {winnerName}!</h2>
          <div className="player-card winner">
            <h3>{winnerName}</h3>
            <p>Dios: {winner?.godName || 'Desconocido'}</p>
          </div>
        </div>

        <div className="versus">VS</div>

        <div className="loser-section">
          <h2>Derrota de {loserName}</h2>
          <div className="player-card loser">
            <h3>{loserName}</h3>
            <p>Dios: {loser?.godName || 'Desconocido'}</p>
          </div>
        </div>
      </div>

      <div className="match-info">
        <h3>Partida: {match?.name || 'Sin nombre'}</h3>
        <p>ID de la partida: {matchId}</p>
      </div>

      <button className="back-button" onClick={handleBackToMatches}>
        Volver a la lista de partidas
      </button>
    </div>
  );
}

export default GameOver;
