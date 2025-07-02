import './Home.css';
import './Perfil.css';
import { useEffect, useState } from 'react';
import defaultProfile from '../assets/default_pfp.png';
import zeus_sprite from '../assets/troop_zeus_sprite.png';
import hades_sprite from '../assets/troop_hades_sprite.png';
import poseidon_sprite from '../assets/troop_poseidon_sprite.png';
import ares_sprite from '../assets/troop_ares_sprite.png';
import apolo_sprite from '../assets/troop_apolo_sprite.png';
import hermes_sprite from '../assets/troop_hermes_sprite.png';
import './Popup.css';

function Perfil() {
  const [user, setUser] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(defaultProfile);

  const imageOptions = [defaultProfile, zeus_sprite, poseidon_sprite, hades_sprite, ares_sprite, apolo_sprite, hermes_sprite];

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    // Si el usuario ya tiene una imagen guardada, usarla
    if (storedUser?.profilePic) {
      setSelectedImage(storedUser.profilePic);
    }
  }, []);

  const handleImageHover = () => {
    setShowPopup(true);
  };

  const handleImageSelect = async(image) => {
    setSelectedImage(image);
    setShowPopup(false);

    // Simula guardar en BDD
    const updatedUser = { ...user, profilePic: image };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/profile/${updatedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json',
                   'Authorization': `Bearer ${localStorage.getItem('token')}`},
        body: JSON.stringify({
          user_id: updatedUser.user_id,
          avatar: updatedUser.profilePic,
          games_won: updatedUser.games_won
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`Error ${res.status}: ${errorData.error}`);
      }

      const data = await res.json();
      console.log('Avatar actualizado correctamente:', data);
    } catch (error) {
      console.error('Error al actualizar el avatar:', error);
    }
    
  };

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div className='home-container'>
      <main className='perfil-main'>
        <div className="perfil-container">
          <div className="perfil-foto" onMouseEnter={handleImageHover}>
            <img src={selectedImage} alt="Foto de perfil" />
          </div>

          <div className="perfil-info">
            <h2>Perfil de Usuario</h2>
            <p><strong>Usuario:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Partidas Ganadas:</strong> {user.games_won}</p>
          </div>
        </div>

        {showPopup && (
          <div className="popup-overlay" onClick={() => setShowPopup(false)}>
            <div className="popup" onClick={(e) => e.stopPropagation()}>
              <h3>Selecciona una nueva foto</h3>
              <div className="image-options">
                {imageOptions.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Opción ${idx + 1}`}
                    onClick={() => handleImageSelect(img)}
                    className="option-img"
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Perfil;