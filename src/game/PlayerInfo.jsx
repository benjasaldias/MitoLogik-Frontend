import { useState, useEffect } from 'react';
import './PlayerInfo.css';

function PlayerInfo({ matchId, currentPlayerId }) {
  const [match, setMatch] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [endingTurn, setEndingTurn] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);
    // Función para finalizar el turno
  const handleEndTurn = async () => {
    try {
      setEndingTurn(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${matchId}/actions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'end_turn',
          player_id: currentPlayerId
        })
      });

      if (!res.ok) {
        throw new Error('No se pudo finalizar el turno');
      }

      // Actualizar la información de la partida
      fetchMatchInfo();
      console.log('Turno finalizado con éxito');
    } catch (err) {
      console.error('Error al finalizar turno:', err);
      setError('Error al finalizar el turno. Inténtalo de nuevo más tarde.');
    } finally {
      setEndingTurn(false);
    }
  };

  const fetchMatchInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${matchId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        throw new Error('No se pudo obtener la información de la partida');
      }      const data = await res.json();
      console.log('Match data in PlayerInfo:', data);
      console.log('Current player ID being used:', currentPlayerId);
      setMatch(data);
      setPlayers(data.Players || []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar la información de la partida:', err);
      setError('Error al cargar la información. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (matchId) {
      fetchMatchInfo();
      
      // Configurar intervalo para refrescar la información cada 5 segundos
      const interval = setInterval(fetchMatchInfo, 5000);
      setRefreshInterval(interval);
    }
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [matchId]);

  if (loading) {
    return <div className="loading-info">Cargando información...</div>;
  }

  if (error) {
    return <div className="error-info">{error}</div>;
  }

  if (!match) {
    return <div className="no-match-info">No se encontró la información de la partida</div>;
  }

  // If currentPlayerId is not provided yet, display a message
  if (!currentPlayerId) {
    return <div className="loading-info">Identificando jugador...</div>;
  }
  // Encontrar al jugador actual usando el player ID en lugar del user ID
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  
  console.log('Current player found in PlayerInfo:', currentPlayer);
  
  // Determinar de quién es el turno usando el player ID
  const isCurrentPlayerTurn = match.current_player === currentPlayerId;
  console.log(`Is current player turn? ${isCurrentPlayerTurn} (match.current_player: ${match.current_player}, currentPlayerId: ${currentPlayerId})`);

  return (
    <div className="player-info">
      <div className="match-info">
        <h2>Partida: {match.name}</h2>
        <div className="match-details">
          <p><span>Ronda:</span> {match.round_number || 1}</p>
          <p className="turn-indicator">
            <span>Turno:</span> 
            <strong className={isCurrentPlayerTurn ? "your-turn" : "opponent-turn"}>
              {isCurrentPlayerTurn ? "Tu turno" : "Oponente"}
            </strong>
          </p>
        </div>
      </div>

      <div className="player-container">
        {/* Información del jugador actual */}
        {currentPlayer && (
          <div className="player-card current-player">
            <h3>Tu información</h3>
            <div className="player-stats">
              <p><span>Oro:</span> {currentPlayer.gold || 0}</p>
              <p><span>Dios:</span> {currentPlayer.god_id || "No seleccionado"}</p>
              <p><span>Aldeas:</span> {currentPlayer.villages_count || 0}</p>
            </div>
          </div>
        )}
      </div>
        {/* Acciones del jugador */}
      {isCurrentPlayerTurn && (
        <div className="player-actions">
          <button 
            className="action-button end-turn"
            onClick={handleEndTurn}
            disabled={endingTurn}
          >
            {endingTurn ? 'Finalizando...' : 'Finalizar turno'}
          </button>
        </div>
      )}
    </div>
  );
}

export default PlayerInfo;
