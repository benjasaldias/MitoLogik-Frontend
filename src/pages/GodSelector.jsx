import { useState } from 'react';
import './GodSelector.css';

import zeus_sprite from '../assets/troop_zeus_sprite.png';
import hades_sprite from '../assets/troop_hades_sprite.png';
import poseidon_sprite from '../assets/troop_poseidon_sprite.png';
import ares_sprite from '../assets/troop_ares_sprite.png';
import apolo_sprite from '../assets/troop_apolo_sprite.png';
import hermes_sprite from '../assets/troop_hermes_sprite.png';

import hoverSoundFile from '../assets/sounds/glitch_001.mp3';
import selectSoundFile from '../assets/sounds/confirmation_003.mp3';

const hoverSound = new Audio(hoverSoundFile);
const selectSound = new Audio(selectSoundFile);

function handleHover() {
  hoverSound.play().catch(() => {}); // evita error si no se puede reproducir
}

function handleClick() {
  selectSound.play().catch(() => {});
}

const gods = [
  { id: 1, name: 'Zeus', sprite: zeus_sprite },
  { id: 2, name: 'Hades', sprite: hades_sprite },
  { id: 3, name: 'Poseidon', sprite: poseidon_sprite },
  { id: 4, name: 'Ares', sprite: ares_sprite },
  { id: 5, name: 'Apolo', sprite: apolo_sprite },
  { id: 6, name: 'Hermes', sprite: hermes_sprite },
];

function GodSelector({ currentGodId, onSelect }) {
  const [selectedGod, setSelectedGod] = useState(currentGodId);

  const handleConfirm = () => {
    if (!selectedGod) return alert('Selecciona un dios');
    onSelect(selectedGod);
  };

  return (
    <div className="god-selector">
      <h3>Elige tu dios</h3>
      <div className="god-grid">
        {gods.map((god) => (
          <div
            key={god.id}
            className={`god-card ${selectedGod === god.id ? 'selected' : ''}`}
            onMouseEnter={handleHover}
            onClick={() => {
              handleClick();
              setSelectedGod(god.id);
            }}
          >
            <div className="god-name-overlay">{god.name}</div>
            <img src={god.sprite} alt={god.name} />
          </div>
        ))}
      </div>
      <button onClick={handleConfirm}>Aceptar</button>
    </div>
  );
}

export default GodSelector;
