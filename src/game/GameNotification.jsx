import { useState, useEffect } from 'react';
import './GameNotification.css';

// Importar efectos de sonido
import confirmationSound from '../assets/sounds/confirmation_002.mp3';
import errorSound from '../assets/sounds/glitch_001.mp3';
import actionSound from '../assets/sounds/confirmation_003.mp3';

function GameNotification({ message, type = 'info', duration = 3000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    // Reproducir sonido según el tipo de notificación
    if (type === 'success') {
      const sound = new Audio(confirmationSound);
      sound.play();
    } else if (type === 'error') {
      const sound = new Audio(errorSound);
      sound.play();
    } else if (type === 'action') {
      const sound = new Audio(actionSound);
      sound.play();
    }
    
    // Ocultar después de la duración especificada
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, duration);
    
    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose, type]);
  
  if (!isVisible) {
    return null;
  }
  
  return (
    <div className={`game-notification notification-${type}`}>
      <p>{message}</p>
    </div>
  );
}

export default GameNotification;
