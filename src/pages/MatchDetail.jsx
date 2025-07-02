import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GameBoard from '../game/GameBoard';
import PlayerInfo from '../game/PlayerInfo';
import GameNotification from '../game/GameNotification';
import './MatchDetail.css';

const TROOP_STATS = {
  1: { type: 1, name: 'warrior',  speed: 4, health: 100, damage: 25, cost: 50 },
  2: { type: 2, name: 'archer', speed: 2, health: 80,  damage: 30, cost: 80 },
  3: { type: 3, name: 'knight', speed: 5, health: 180, damage: 45, cost: 120 },
  4: { type: 4, name: 'skeleton', speed: 5, health: 60,  damage: 15, cost: 20 }
};

const GOD_ACTION_COSTS = {
  1: 700,
  2: 0,
  3: 0,
  4: 1000,
  5: 1000 
};

const GOD_NAMES = {
  1: 'Zeus',
  2: 'Ares',
  3: 'Poseidon',
  4: 'Hades',
  5: 'Demeter',
  6: 'Hermes',
  7: 'Apolo'
};

function MatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [match, setMatch] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [creatingTroop, setCreatingTroop] = useState(false);
  
  // Obtener información del usuario actual
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser.id;

  // Cuando se selecciona una casilla en el tablero
  const handleTileSelect = (tile) => {
    setSelectedTile(tile);
    console.log('Casilla seleccionada:', tile);
    
    // Debug: Información importante para depurar la creación de tropas
    console.log('Información para crear tropas:');
    console.log('- Coordenadas:', tile.x, tile.y);
    console.log('- ID del usuario actual:', currentUserId);
    console.log('- ID del host:', match?.host_user_id);
    console.log('- Es host user:', match?.host_user_id === currentUserId);
    console.log('- Es el turno del jugador:', match?.current_player === currentPlayerId);
    
    // Verificar si hay tropas en la casilla
    if (tile.Troops && Array.isArray(tile.Troops) && tile.Troops.length > 0) {
      console.log('Hay tropas en esta casilla:', tile.Troops);
    } else if (tile.Troop) {
      console.log('Hay una tropa en esta casilla:', tile.Troop);
    } else {
      console.log('No hay tropas en esta casilla');
    }

    // Verificar si hay un settlement en la casilla
    if (tile.Settlement) {
      console.log('Hay un asentamiento en esta casilla:', tile.Settlement);
    } else {
      console.log('No hay asentamiento en esta casilla');
    }

    // Verificar si es una casilla especial para crear tropas
    const isSpecialTile1 = tile.x === 1 && tile.y === 1 && match?.host_user_id === currentUserId;
    const isSpecialTile2 = tile.x === 12 && tile.y === 12 && match?.host_user_id !== currentUserId;
    
    if (isSpecialTile1) {
      console.log('¡BASE DEL HOST SELECCIONADA! Deberías poder crear tropas aquí si eres el host.');
    } else if (isSpecialTile2) {
      console.log('¡BASE DEL JUGADOR NO-HOST SELECCIONADA! Deberías poder crear tropas aquí si NO eres el host.');
    }
    
    // Mensaje claro sobre si el usuario puede crear tropas en esta casilla
    if ((isSpecialTile1 || isSpecialTile2) && match?.current_player === currentPlayerId) {
      console.log('✅ PUEDES CREAR TROPAS EN ESTA CASILLA');
    } else if (isSpecialTile1 || isSpecialTile2) {
      console.log('❌ NO PUEDES CREAR TROPAS PORQUE NO ES TU TURNO');
    }
  };

  // Estado para manejar notificaciones
  const [notification, setNotification] = useState(null);
  
  // Función para crear una nueva tropa
  const handleCreateTroop = async (troopType) => {
    try {
      setCreatingTroop(true);
      console.log(`Creando tropa tipo ${troopType} en tile ${selectedTile.id}`);
      
      // Depuración
      console.log('Datos para crear tropa:');
      console.log('- Match ID:', id);
      console.log('- Player ID:', currentPlayerId);
      console.log('- Tile ID:', selectedTile.id);
      console.log('- Coordenadas de tile:', selectedTile.x, selectedTile.y);
      console.log('- Troop type:', troopType);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${id}/actions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          match_id: id,
          player_id: currentPlayerId,
          type: 'create_troop',
          troop_type: troopType,
          tile_id: selectedTile.id
        })
      });

      if (!res.ok) {
        throw new Error('No se pudo crear la tropa');
      }
      
      // Actualizar datos de la partida para reflejar cambios
      await fetchMatchData();
      
      // Mostrar notificación de éxito
      setNotification({
        message: `¡${TROOP_STATS[troopType]?.name || 'Tropa'} creada con éxito!`,
        type: 'success'
      });
      
      console.log('Tropa creada exitosamente');
      
    } catch (err) {
      console.error('Error al crear tropa:', err);
      
      // Mostrar notificación de error
      setNotification({
        message: 'No se pudo crear la tropa',
        type: 'error'
      });
    } finally {
      setCreatingTroop(false);
    }
  };

  const handleUseGodAction = async () => {
    
  try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${id}/actions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player_id: currentPlayerId,
          type: 'summon_god',

        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Detalles del error:', errorData);
        throw new Error('No se pudo invocar al dios');
      }


    const data = await res.json(); 
    if (res.ok) {
      setNotification({ message: '¡Habilidad usada!', type: 'success' });
      // Opcional: recargar el tablero
    } else {
      setNotification({ message: data.error || 'No se pudo usar la habilidad', type: 'error' });
    }
  } catch (err) {
    console.error(err);
    // alert(err);
    setNotification({ message: 'Error al usar habilidad', type: 'error' });
  }
};


  // Función para obtener datos actualizados de la partida
  const fetchMatchData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        throw new Error('No se pudo obtener la información de la partida');
      }

      const data = await res.json();
      
      console.log('Match data in MatchDetail:', data);
      
      // Verificar el estado de la partida
      // Si state = 0 (no iniciada), redirigir al lobby
      if (data.state === 0 || data.state === '0') {
        console.log('Match is not in progress, redirecting to lobby');
        navigate(`/matches/${id}/lobby`);
        return false;
      }
      
      // Si state = 2 (finalizada), redirigir a la pantalla de GameOver
      if (data.state === 2 || data.state === '2') {
        console.log('Match is over, redirecting to game over screen');
        navigate(`/matches/${id}/gameover`);
        return false;
      }
      
      setMatch(data);
      
      // Find the player ID associated with the current user
      if (data.Players && data.Players.length > 0) {
        const player = data.Players.find(p => p.user_id === currentUserId);
        if (player) {
          console.log('Found player for current user:', player);
          console.log(`User ID ${currentUserId} has player ID ${player.id}`);
          setCurrentPlayerId(player.id);
        } else {
          console.warn('Current user is not a player in this match');
        }
      }
      
      setError(null);
      return true;
    } catch (err) {
      console.error('Error al cargar la información de la partida:', err);
      setError('Error al cargar la partida. Por favor, inténtalo de nuevo más tarde.');
      return false;
    }
  };

  useEffect(() => {
    const fetchMatchInfo = async () => {
      setLoading(true);
      await fetchMatchData();
      setLoading(false);
    };

    if (id) {
      fetchMatchInfo();
      
      // Configurar intervalo para actualizar la partida cada 10 segundos
      const interval = setInterval(fetchMatchInfo, 10000);
      
      // Limpiar intervalo al desmontar
      return () => clearInterval(interval);
    }
  }, [id, navigate, currentUserId]);

  // Función de ayuda para extraer información de tropas de una casilla
  const getTroopInfo = (tile) => {
    if (!tile) return null;
    
    if (tile.Troops && Array.isArray(tile.Troops) && tile.Troops.length > 0) {
      return tile.Troops[0]; // Devolver la primera tropa
    } else if (tile.Troop) {
      return tile.Troop;
    } else if (tile.troops && Array.isArray(tile.troops) && tile.troops.length > 0) {
      return tile.troops[0];
    } else if (tile.troop) {
      return tile.troop;
    } else if (tile.unit) {
      return tile.unit;
    }
    
    return null;
  };
  
  // Función para determinar si una casilla es base para el jugador actual
  const isPlayerBase = (tile) => {
    if (!tile || !match) return false;
    
    if (tile.player_id == currentPlayerId) {
      return true;
    }

    return (
      (tile.x === 1 && tile.y === 1 && match.host_user_id === currentUserId) || 
      (tile.x === 12 && tile.y === 12 && match.host_user_id !== currentUserId)
    );
  };

  if (loading) {
    return <div className="match-loading">Cargando partida...</div>;
  }

  if (error) {
    return (
      <div className="match-error">
        <div className="error-content">
          <h3>Error</h3>
          <p>{error}</p>
          <button 
            className="return-button"
            onClick={() => navigate('/matches')}
          >
            Volver a partidas
          </button>
        </div>
      </div>
    );
  }

  // Extraer información de tropas si hay una casilla seleccionada
  const troopInfo = selectedTile ? getTroopInfo(selectedTile) : null;
  const isBase = selectedTile ? isPlayerBase(selectedTile) : false;
  const currentPlayer = match.Players?.find(p => p.id === currentPlayerId);
  const playerGodId = currentPlayer?.god_id;

  return (
    <div className="match-detail-container">
      <div className="match-header">
        <button 
          className="return-button"
          onClick={() => navigate('/matches')}
        >
          ← Volver a partidas
        </button>
        
        {match && (
          <h2 className="match-title">{match.name}</h2>
        )}
      </div>
      
      {/* Mostrar notificación si existe */}
      {notification && (
        <GameNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="match-content">
        <div className="match-info-section">
          <PlayerInfo 
            matchId={id} 
            currentPlayerId={currentPlayerId}
          />
          
          {selectedTile && (
            <div className="selected-tile-info">
              <h3>Casilla seleccionada</h3>
              <p>Posición: ({selectedTile.x}, {selectedTile.y})</p>
              <p>Terreno: {selectedTile.terrain_type || 'Desconocido'}</p>
              
              {/* Mostrar información de tropa si existe */}
              {troopInfo && (
                <>
                  <h4>Información de tropa</h4>
                  <p>
                    Tipo: {TROOP_STATS[troopInfo.type]?.name || `Tipo ${troopInfo.type}`}
                  </p>
                  <p>Salud: {troopInfo.health || '?'}</p>
                  <p>Daño: {troopInfo.damage || TROOP_STATS[troopInfo.type]?.damage || '?'}</p>
                  <p>Velocidad: {troopInfo.speed || TROOP_STATS[troopInfo.type]?.speed || '?'}</p>
                  <p>Pertenece a: {
                    troopInfo.player_id === currentPlayerId
                      ? 'Tu tropa'
                      : 'Enemigo'
                  }</p>
                </>
              )}
              
              {/* Mostrar información de asentamiento si es una casilla especial o tiene settlement */}
              {(isBase || selectedTile.Settlement || selectedTile.settlement) && (
                <>
                  <h4>Asentamiento</h4>
                  {isBase && (
                    <>
                      <p className="special-settlement">
                        Asentamiento Aliado
                      </p>
                      <p>Salud: 100</p>
                      <p>Producción de oro: 60/turno</p>
                      {/* {isBase && <p className="base-info">✨ Esta es tu base principal ✨</p>} */}
                    </>
                  )}
                  
                  {/* Mostrar info específica del settlement si no es base y existe */}
                  {!isBase && (selectedTile.Settlement || selectedTile.settlement) && (
                    <>
                      <p>Aldea</p>
                      <p>Tipo: {
                        selectedTile.Settlement?.type || 
                        selectedTile.settlement?.type || 
                        'Estándar'
                      }</p>
                      <p>Salud: {
                        selectedTile.Settlement?.health || 
                        selectedTile.settlement?.health || 
                        '?'
                      }</p>
                    </>
                  )}
                </>
              )}
              
            {/* Opciones para crear tropas solo si es una casilla especial y es el turno del jugador */}
            {isBase && match && match.current_player === currentPlayerId && !troopInfo && (
              <div className="create-troop-section">
                <h4>Crear tropa:</h4>
                <div className="troop-options">
                  {Object.entries(TROOP_STATS).map(([troopId, troop]) => {
                    const playerGold = currentPlayer?.gold || 0;
                    const canAfford = playerGold >= troop.cost;

                    // Si la tropa es skeleton y el jugador no es del dios 2 (Hades), no renderizar
                    if (troop.name === 'skeleton' && playerGodId !== 2) return null;

                    return (
                      <button 
                        key={troopId} 
                        className={`troop-button ${canAfford ? '' : 'disabled'}`}
                        onClick={() => canAfford && handleCreateTroop(Number(troopId))}
                        disabled={!canAfford || creatingTroop}
                        title={!canAfford ? 'Oro insuficiente' : ''}
                      >
                        {troop.name} ({troop.cost} oro)
                        <div className="troop-stats">
                          <small>Vida: {troop.health} | Daño: {troop.damage}</small>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Botón para usar habilidad divina */}
                {playerGodId && playerGodId != 2 && playerGodId != 3 && playerGodId != 6 && (
                  <div className="god-action">
                    <button 
                      className="god-button"
                      onClick={handleUseGodAction}
                    >
                      Invocar Dios ({GOD_ACTION_COSTS[playerGodId]} oro)
                    </button>
                  </div>
                )}
              </div>
            )}

            </div>
          )}
        </div>
        
        <div className="match-board-section">
          <GameBoard 
            matchId={id} 
            onTileSelect={handleTileSelect} 
            currentPlayerId={currentPlayerId}
          />
        </div>
      </div>
    </div>
  );
}

export default MatchDetail;
