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

// Mapa de dioses a sprites de aldeas
const villageSprites = {
  "apolo": villageApoloSprite,
  "ares": villageAresSprite,
  "demeter": villageDemeterSprite,
  "zeus": villageZeusSprite,
  "hades": villageHadesSprite,
  "poseidon": villagePoseidonSprite,
  "hermes": villageHermesSprite,
  "enemy": villageEnemySprite,
  "abandoned": villageAbandonedSprite
};

// Mapa de dioses a sprites de tropas
const troopSprites = {
  "apolo": troopApoloSprite,
  "ares": troopAresSprite,
  "demeter": troopDemeterSprite,
  "zeus": troopZeusSprite,
  "hades": troopHadesSprite,
  "poseidon": troopPoseidonSprite,
  "hermes": troopHermesSprite,
  "skeleton": skeletonSprite
};

// Mapa auxiliar para convertir god_id → nombre clave en villageSprites
const godIdToName = {
  1: 'zeus',
  2: 'hades',
  3: 'poseidon',
  4: 'ares',
  5: 'apolo',
  6: 'hermes',
  7: 'demeter'
};

// Mapa auxiliar para convertir god_id → nombre clave en villageSprites
const typeToWeapon = {
  'warrior': swordSprite,
  'archer' : bowSprite,
  'knight': swordSprite,
  'skeleton': swordSprite
};

const typeIdToType = {
  1 : 'warrior',
  2 : 'archer',
  3 : 'knight',
  4 : 'skeleton'
};


function Tile({ currentPlayerId, tile, players = [], onSelect, isSelected, isValidMove, isVisible = true }) {

  const terrainSprite = terrainSprites[tile.terrain_type] || grassSprite;

  const hasSpecialObject = tile.has_trees;
  const specialObjectSprite = hasSpecialObject ? treesSprite : null;

  let hasTroop = false;
  let troopSprite = null;
  let firstTroop = null;
  let weaponSprite = null;


  if (tile.Troops && Array.isArray(tile.Troops) && tile.Troops.length > 0) {
    hasTroop = true;
    firstTroop = tile.Troops[0];
    // alert(tile.Troops[0].id);
    troopSprite = troopSprites[godIdToName[tile.Troops[0].god_id]];
    if (tile.Troops[0].type == 4) {
      troopSprite = skeletonSprite;
    }
    weaponSprite = typeToWeapon[typeIdToType[tile.Troops[0].type]];
  } 

  const isEnemyTroop = firstTroop && firstTroop.player_id !== currentPlayerId;

  let hasSettlement = false;
  let settlementSprite = null;
  const isSpecialCoord = (tile.x === 1 && tile.y === 1) || (tile.x === 12 && tile.y === 12);

  if (tile.Settlement || isSpecialCoord) {
    hasSettlement = true;

    if (tile.player_id != null) {
      const owner = players.find(p => p.id === tile.player_id);
      const godKey = godIdToName[tile.Settlement.god_id];
      settlementSprite = villageSprites[godKey] || villageSprites['zeus'];
      // alert(tile.Settlement);
    } else {
      settlementSprite = villageSprites['abandoned'];
    }
  }

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
    >
      {isVisible ? (
        <div className="tile-content" style={{ backgroundImage: `url(${terrainSprite})` }}>
          {hasSpecialObject && (
            <div className="tile-special-object" style={{ backgroundImage: `url(${specialObjectSprite})` }}></div>
          )}

          {hasSettlement && (
            <div className="tile-village" style={{ backgroundImage: `url(${settlementSprite})` }}></div>
          )}

          {hasTroop && (
            <div
              className={`tile-unit 
                ${firstTroop?.moves_used === firstTroop?.speed ? 'unit-exhausted' : ''} 
              `}
            >
              <div
                className={`troop-sprite ${isEnemyTroop ? 'enemy-glow' : ''} ${firstTroop?.type === 3 ? 'knight-size' : ''}`}
                style={{ backgroundImage: `url(${troopSprite})` }}
              ></div>
              <div
                className="weapon-overlay"
                style={{ backgroundImage: `url(${weaponSprite})` }}
              ></div>
            </div>
          )}
          
          <span className="tile-coordinates">
            {tile.x},{tile.y}
          </span>
        </div>
      ) : (
        <div className="tile-content fog-content">
          <div className="fog-of-war-overlay" style={{ backgroundImage: `url(${fogWarSprite})` }}></div>
        </div>
      )}
    </div>
  );
}

export default Tile;
