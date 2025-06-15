import { useState, useEffect } from 'react';
import Tile from './Tile';
import GameNotification from './GameNotification';
import './GameBoard.css';

// Importamos el sprite para la niebla de guerra
import fogWarSprite from '../assets/fog_war_sprite.png';

function GameBoard({ matchId, onTileSelect, currentPlayerId }) {
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [visibleTiles, setVisibleTiles] = useState([]);
  const [pollInterval, setPollInterval] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Cargar las casillas de la partida
  useEffect(() => {
    const fetchTiles = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${matchId}/tiles`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!res.ok) {
          throw new Error('No se pudieron obtener las casillas del tablero');
        }

        const data = await res.json();
        console.log('Tiles cargadas:', data.length);
        
        // Log de una muestra de las tiles para debug
        if (data && data.length > 0) {
          console.log('Ejemplo de una tile:', data[0]);
          
          // Verificar si hay tropas en alguna tile
          const tilesWithTroops = data.filter(tile => 
            (tile.Troops && tile.Troops.length) || 
            tile.Troop || 
            (tile.troops && tile.troops.length) || 
            tile.troop
          );
          
          if (tilesWithTroops.length > 0) {
            console.log(`Se encontraron ${tilesWithTroops.length} tiles con tropas.`);
            console.log('Ejemplo de tile con tropa:', tilesWithTroops[0]);
          } else {
            console.log('No se encontraron tiles con tropas.');
          }
        }
        
        // Obtener casillas visibles para el jugador actual
        if (currentPlayerId) {
          const visibleTileRes = await fetch(`${import.meta.env.VITE_API_URL}/matches/${matchId}/visible-tiles?player_id=${currentPlayerId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (visibleTileRes.ok) {
            const visibleData = await visibleTileRes.json();
            console.log('Datos de casillas visibles:', visibleData);
            if (visibleData.tiles && Array.isArray(visibleData.tiles)) {
              console.log('Casillas visibles:', visibleData.tiles.length);
              setVisibleTiles(visibleData.tiles.map(vt => vt.id));
              // Extraer IDs de tiles visibles entregadas por el backend
              const baseVisibleIds = visibleData.tiles.map(vt => vt.id);

              // Crear un set para evitar duplicados
              const expandedVisibleSet = new Set(baseVisibleIds);

              // Construir mapa para lookup rápido
              const tileMap = new Map();
              data.forEach(tile => tileMap.set(tile.id, tile));

              // Por cada tile visible, agregar sus adyacentes
              for (const vt of visibleData.tiles) {
                const { x, y } = vt;

                const adjacents = [
                  [x + 1, y],
                  [x - 1, y],
                  [x, y + 1],
                  [x, y - 1],
                ];

                for (const [adjX, adjY] of adjacents) {
                  const adjacentTile = data.find(t => t.x === adjX && t.y === adjY);
                  if (adjacentTile) {
                    expandedVisibleSet.add(adjacentTile.id);
                  }
                }
              }

              // Actualiza el estado con el nuevo conjunto expandido
              setVisibleTiles([...expandedVisibleSet]);

            } else {
              console.error('El formato de casillas visibles no es el esperado:', visibleData);
            }
          }
        } else {
          console.log('No se pueden obtener casillas visibles porque currentPlayerId no está disponible.');
        }
        
        // Verificar que data es un array antes de asignarlo
        if (Array.isArray(data)) {
          setTiles(data);
        } else {
          console.error('Los datos de tiles no son un array:', data);
          setTiles([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error al cargar las casillas:', err);
        setError('Error al cargar el tablero. Inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    if (matchId) {
      fetchTiles();
      
      // Configurar polling para actualizar las casillas cada 10 segundos
      const interval = setInterval(fetchTiles, 10000);
      setPollInterval(interval);
    }
    
    // Limpiar el intervalo al desmontar el componente
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [matchId, currentPlayerId]);

  // Nueva función para mover tropas usando el endpoint de acciones
  const moveTroop = async (fromTileId, toTileId) => {
    try {
      console.log(`Intentando mover tropa de tile ${fromTileId} a tile ${toTileId}`);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/matches/${matchId}/actions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player_id: currentPlayerId,
          type: 'move_troop',
          fromTileId: fromTileId,
          toTileId: toTileId
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Detalles del error:', errorData);
        throw new Error('No se pudo mover la tropa');
      }

      // Actualizar las casillas después de mover la tropa
      const fetchTilesRes = await fetch(`${import.meta.env.VITE_API_URL}/matches/${matchId}/tiles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (fetchTilesRes.ok) {
        const data = await fetchTilesRes.json();
        if (Array.isArray(data)) {
          setTiles(data);
        }
      }
      
      // Limpiar selección
      setSelectedTile(null);
      setValidMoves([]);
      
      // Mostrar notificación de éxito
      setNotification({
        message: '¡Tropa movida con éxito!',
        type: 'success'
      });
      
    } catch (err) {
      console.error('Error al mover tropa:', err);
      setNotification({
        message: 'No se pudo mover la tropa: ' + err.message,
        type: 'error'
      });
    }
  };  // Manejar la selección de casillas
  const handleTileSelect = (tile) => {
    // No procesar selecciones si no hay ID de jugador
    if (!currentPlayerId) {
      console.log('No player ID available yet');
      return;
    }
    
    // Si ya hay una casilla seleccionada
    if (selectedTile) {
      // Si es la misma casilla, deseleccionarla
      if (selectedTile.id === tile.id) {
        setSelectedTile(null);
        setValidMoves([]);
        return;
      }
      
      // Verificamos si la casilla de origen tiene una tropa del jugador
      let hasTroopInSource = false;
      let sourceTroopPlayerId = null;
      
      // Detectar tropa en casilla origen y su propietario
      if (selectedTile.Troops && Array.isArray(selectedTile.Troops) && selectedTile.Troops.length > 0) {
        hasTroopInSource = true;
        sourceTroopPlayerId = selectedTile.Troops[0].player_id;
      } else if (selectedTile.Troop) {
        hasTroopInSource = true;
        sourceTroopPlayerId = selectedTile.Troop.player_id;
      } else if (selectedTile.troops && Array.isArray(selectedTile.troops) && selectedTile.troops.length > 0) {
        hasTroopInSource = true;
        sourceTroopPlayerId = selectedTile.troops[0].player_id;
      } else if (selectedTile.troop) {
        hasTroopInSource = true;
        sourceTroopPlayerId = selectedTile.troop.player_id;
      } else if (selectedTile.unit) {
        hasTroopInSource = true;
        sourceTroopPlayerId = selectedTile.unit.player_id;
      }
      
      // Si hay una tropa propia en el origen, intentar moverla
      if (hasTroopInSource && sourceTroopPlayerId === currentPlayerId) {
        console.log(`Intentando mover tropa de ${selectedTile.id} a ${tile.id}`);
        moveTroop(selectedTile.id, tile.id);
      } else {
        console.log('No puedes mover desde una casilla sin tropa propia');
      }
      
      // Limpiamos la selección en cualquier caso
      setSelectedTile(null);
      setValidMoves([]);
      return;
    }
    
    // Seleccionar la casilla si no había ninguna seleccionada previamente
    setSelectedTile(tile);
    
    // Verificar si hay tropas en la casilla que pertenezcan al jugador actual
    let hasPlayerUnit = false;
    
    // Verificar si hay tropas en la casilla y pertenecen al jugador actual
    if (tile.Troops && Array.isArray(tile.Troops) && tile.Troops.length > 0) {
      hasPlayerUnit = tile.Troops[0].player_id === currentPlayerId;
    } else if (tile.Troop) {
      hasPlayerUnit = tile.Troop.player_id === currentPlayerId;
    } else if (tile.troops && Array.isArray(tile.troops) && tile.troops.length > 0) {
      hasPlayerUnit = tile.troops[0].player_id === currentPlayerId;
    } else if (tile.troop) {
      hasPlayerUnit = tile.troop.player_id === currentPlayerId;
    } else if (tile.unit) { // Fallback para propiedad legacy
      hasPlayerUnit = tile.unit.player_id === currentPlayerId;
    }
    
    // Si hay una tropa del jugador actual en la casilla, mostrar posibles movimientos
    if (hasPlayerUnit) {
      // Calculamos nosotros los movimientos válidos
      const possibleMoves = calculateValidMoves(tile, tiles);
      setValidMoves(possibleMoves);
    } else {
      // Si no hay tropa del jugador, no hay movimientos válidos
      setValidMoves([]);
    }
    
    // Llamar al callback si existe
    if (onTileSelect) {
      onTileSelect(tile);
    }
  };
  
  // Función para calcular movimientos válidos (simplificada)
  const calculateValidMoves = (tile, allTiles) => {
    // Verificar si hay tropa en la casilla
    const hasTroop = 
      (tile.Troops && Array.isArray(tile.Troops) && tile.Troops.length > 0) ||
      tile.Troop ||
      (tile.troops && Array.isArray(tile.troops) && tile.troops.length > 0) ||
      tile.troop ||
      tile.unit;  // Fallback para propiedad legacy
    
    // Si no hay tropa, no hay movimientos válidos
    if (!hasTroop) return [];
    
    // Para simplificar, asumimos que la tropa puede moverse a casillas adyacentes
    return allTiles.filter(t => {
      // Solo casillas adyacentes
      const isAdjacent = 
        (Math.abs(t.x - tile.x) === 1 && t.y === tile.y) || 
        (Math.abs(t.y - tile.y) === 1 && t.x === tile.x);
      
      // Verificar si hay tropas en la casilla destino
      const hasTroopInTargetTile = 
        (t.Troops && Array.isArray(t.Troops) && t.Troops.length > 0) ||
        t.Troop ||
        (t.troops && Array.isArray(t.troops) && t.troops.length > 0) ||
        t.troop ||
        t.unit;
      
      // No puede haber otra tropa aliada (podemos mover a casillas con tropas enemigas para atacar)
      const isEmpty = !hasTroopInTargetTile || 
        (hasTroopInTargetTile && t.Troops && t.Troops[0].player_id !== currentPlayerId) ||
        (hasTroopInTargetTile && t.Troop && t.Troop.player_id !== currentPlayerId) ||
        (hasTroopInTargetTile && t.troops && t.troops[0].player_id !== currentPlayerId) ||
        (hasTroopInTargetTile && t.troop && t.troop.player_id !== currentPlayerId) ||
        (hasTroopInTargetTile && t.unit && t.unit.player_id !== currentPlayerId);
      
      // No puede ser agua para tropas terrestres (simplificación)
      const isValidTerrain = t.terrain_type !== 'water';
      
      return isAdjacent && isEmpty && isValidTerrain;
    }).map(t => t.id);
  };
  
  // Comprobar si una casilla es visible para el jugador
  const isTileVisible = (tileId) => {
    return visibleTiles.includes(tileId);
  };
  
  // Determinar el tamaño del tablero
  // Asegurarnos de que usamos el máximo valor correcto (las coordenadas empiezan desde 1,1)
  const boardSize = Array.isArray(tiles) && tiles.length > 0 ? 
    { 
      width: Math.max(...tiles.map(t => t.x)),
      height: Math.max(...tiles.map(t => t.y))
    } : 
    { width: 12, height: 12 };
  
  console.log('Tamaño del tablero calculado:', boardSize);
    
  // Ordenar las casillas por coordenadas para mostrarlas correctamente en la cuadrícula
  // Invirtiendo el orden de Y para que 1,1 aparezca en la esquina inferior izquierda
  const sortedTiles = Array.isArray(tiles) ? 
    [...tiles].sort((a, b) => {
      if (a.y !== b.y) {
        // Organizar por Y de manera descendente (mayor Y arriba)
        return b.y - a.y;
      }
      // Dentro de cada fila, ordenar por X de izquierda a derecha
      return a.x - b.x;
    }) : [];

  if (loading) {
    return <div className="loading-board">Cargando tablero...</div>;
  }
  if (error) {
    return <div className="error-board">{error}</div>;
  }
  
  return (
    <div className="game-board-container">
      <div className="game-board" style={{ 
        gridTemplateColumns: `repeat(${boardSize.width}, 50px)`,
        gridTemplateRows: `repeat(${boardSize.height}, 50px)`,
        gridAutoFlow: 'row'
      }}>
        {sortedTiles.map(tile => (
          <Tile 
            key={tile.id} 
            tile={tile} 
            onSelect={handleTileSelect} 
            isSelected={selectedTile && selectedTile.id === tile.id}
            isValidMove={validMoves.includes(tile.id)}
            isVisible={isTileVisible(tile.id)}
          />
        ))}
      </div>
      
      {notification && (
        <GameNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default GameBoard;
