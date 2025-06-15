import { useState, useEffect } from 'react';
import './Tile.css';

// Importamos los sprites de diferentes terrenos
import grassSprite from '../assets/sprite_grass_terrain.png';
import waterSprite from '../assets/sprite_water_terrain.png';
import rockSprite from '../assets/sprite_rock_terrain.png';
import desertSprite from '../assets/sprite_desert_terrain.png';
import treesSprite from '../assets/trees_sprite.png';
import fogWarSprite from '../assets/fog_war_sprite.png';

// Importamos los sprites de unidades
import swordSprite from '../assets/sword_sprite.png';
import bowSprite from '../assets/bow_arrow_sprite.png';
import skeletonSprite from '../assets/skeleton_sprite.png';

// Importamos los sprites de aldeas
import villageApoloSprite from '../assets/village_apolo_sprite.png';
import villageAresSprite from '../assets/village_ares_sprite.png';
import villageDemeterSprite from '../assets/village_demeter_sprite.png';
import villageZeusSprite from '../assets/village_zeus_sprite.png';
import villageHadesSprite from '../assets/village_hades_sprite.png';
import villagePoseidonSprite from '../assets/village_poseidon_sprite.png';
import villageHermesSprite from '../assets/village_hermes_sprite.png';
import villageEnemySprite from '../assets/village_enemy_sprite.png';
import villageAbandonedSprite from '../assets/village_abandoned_sprite.png';

// Importamos sprites de tropas
import troopZeusSprite from '../assets/troop_zeus_sprite.png';
import troopAresSprite from '../assets/troop_ares_sprite.png';
import troopPoseidonSprite from '../assets/troop_poseidon_sprite.png';
import troopHadesSprite from '../assets/troop_hades_sprite.png';
import troopDemeterSprite from '../assets/troop_demeter_sprite.png';
import troopHermesSprite from '../assets/troop_hermes_sprite.png';
import troopApoloSprite from '../assets/troop_apolo_sprite.png';

// Mapa de tipos de terreno a sus respectivos sprites
const terrainSprites = {
  grass: grassSprite,
  water: waterSprite,
  rock: rockSprite,
  desert: desertSprite
};

// Mapa de tipos de unidades a sus respectivos sprites
const unitSprites = {
  1: swordSprite,
  2: bowSprite,
  3: skeletonSprite,
  // Agregar más tipos de unidades según sea necesario
};

// Mapa de dioses a sprites de tropas (para uso futuro si es necesario asociar dioses a tropas)
const godTroopSprites = {
  1: troopZeusSprite,    // Zeus
  2: troopAresSprite,    // Ares
  3: troopPoseidonSprite, // Poseidon
  4: troopHadesSprite,    // Hades
  5: troopDemeterSprite,  // Demeter
  6: troopHermesSprite,   // Hermes
  7: troopApoloSprite     // Apolo
};

// Mapa para obtener el sprite de tropa basado en el tipo de tropa
const troopTypeSprites = {
  1: swordSprite,      // Guerrero
  2: bowSprite,        // Arquero
  3: skeletonSprite    // Esqueleto
  // Agregar más tipos según sea necesario
};

// Mapa de tipos de aldeas a sus respectivos sprites
const villageSprites = {
  apolo: villageApoloSprite,
  ares: villageAresSprite,
  demeter: villageDemeterSprite,
  zeus: villageZeusSprite,
  hades: villageHadesSprite,
  poseidon: villagePoseidonSprite,
  hermes: villageHermesSprite,
  enemy: villageEnemySprite,
  abandoned: villageAbandonedSprite
};

function Tile({ tile, onSelect, isSelected, isValidMove, isVisible = true }) {
  // Obtener el sprite correcto según el tipo de terreno
  const terrainSprite = terrainSprites[tile.terrain_type] || grassSprite;
  
  // Determinar si hay un objeto especial (árboles, rocas, etc.)
  const hasSpecialObject = tile.has_trees;
  const specialObjectSprite = hasSpecialObject ? treesSprite : null;

  // Comprobación de existencia de tropas y formato correcto
  // Determinar si hay tropas en la casilla
  let hasTroop = false;
  let troopSprite = null;
    // Verificar formato de tropas (puede ser array Troops o propiedad Troop)
  if (tile.Troops && Array.isArray(tile.Troops) && tile.Troops.length > 0) {
    // Si es un array y tiene elementos
    hasTroop = true;
    // Usar primera tropa para visualización
    const firstTroop = tile.Troops[0];
    // Intentar usar el tipo de tropa para seleccionar sprite
    troopSprite = troopZeusSprite;
    console.log(`Tropa renderizada en (${tile.x},${tile.y}): Tipo ${firstTroop.type}`);
  } else if (tile.Troop) {
    // Si es un objeto individual de tropa
    hasTroop = true;
    troopSprite =  troopZeusSprite;
    console.log(`Tropa (singular) renderizada en (${tile.x},${tile.y}): Tipo ${tile.Troop.type}`);
  } else if (tile.troops && Array.isArray(tile.troops) && tile.troops.length > 0) {
    // Comprobación alternativa para lowercase 'troops'
    hasTroop = true;
    troopSprite = troopZeusSprite;
  } else if (tile.troop) {
    // Comprobación alternativa para lowercase 'troop'
    hasTroop = true;
    troopSprite = troopZeusSprite;
  } else {
    // Fallback para propiedad legacy 'unit'
    if (tile.unit) {
      hasTroop = true;
      troopSprite = troopZeusSprite;
    }
  }

  // Determinar si hay una aldea y qué sprite mostrar
  // Comprobación para settlements (similar a tropas)
  let hasSettlement = false;
  let settlementSprite = null;

  // Verificar diferentes formatos posibles para settlements
  const isSpecialCoord = (tile.x === 1 && tile.y === 1) || (tile.x === 12 && tile.y === 12);
  
  if (tile.Settlement) {
    // Caso 1: Hay un objeto Settlement directo
    hasSettlement = true;
    settlementSprite = villageSprites['apolo']; // O usar tile.Settlement.type si existe
  } else if (tile.settlement) {
    // Caso 2: Lowercase 'settlement'
    hasSettlement = true;
    settlementSprite = villageSprites['apolo'];
  } else if (isSpecialCoord) {
    // Caso 3: Forzar asentamientos en coordenadas especiales
    hasSettlement = true;
    settlementSprite = villageSprites['apolo'];
  }
    
  // Clases para estilos según el estado de la casilla
  const tileClasses = `
    game-tile 
    ${isSelected ? 'selected' : ''} 
    ${isValidMove ? 'valid-move' : ''} 
    ${!isVisible ? 'fog-of-war' : `terrain-${tile.terrain_type || 'unknown'}`}
  `;

  return (
    <div 
      className={tileClasses}
      onClick={() => onSelect(tile)}
    >      {isVisible ? (
        <div className="tile-content" style={{ backgroundImage: `url(${terrainSprite})` }}>
          {/* Renderizar objeto especial si está presente */}
          {hasSpecialObject && (
            <div className="tile-special-object" style={{ backgroundImage: `url(${specialObjectSprite})` }}></div>
          )}
          
          {/* Renderizar aldea si está presente o es una coordenada especial */}
          {hasSettlement && (
            <div className="tile-village" style={{ backgroundImage: `url(${settlementSprite})` }}></div>
          )}
          
          {/* Renderizar tropa si está presente - ahora por encima de la aldea */}
          {hasTroop && (
            <div className="tile-unit" style={{ backgroundImage: `url(${troopSprite})` }}></div>
          )}
          
          {/* Mostrar coordenadas para debug */}
          <span className="tile-coordinates">
            {tile.x},{tile.y}
          </span>
        </div>
      ) : (
        <div className="tile-content fog-content">
          {/* Contenido para niebla de guerra */}
          <div className="fog-of-war-overlay" style={{ backgroundImage: `url(${fogWarSprite})` }}></div>
        </div>
      )}
    </div>
  );
}

export default Tile;
