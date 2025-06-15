import './Instructions.css';
import { Link } from 'react-router-dom';

function Instructions() {
  return (
    <div className="instructions-container">
      <main className="instructions-main">
        <h1 className="title">Instrucciones de Juego</h1>
        
        <div className="instruction-card">
          <h2>1. Objetivo del Juego</h2>
          <p>El objetivo de este juego es superar a tu contrincante, destruyendo todos sus asentamientos!</p>
        </div>
        
        <div className="instruction-card">
          <h2>2. Recursos</h2>
          <p>Reune oro según el número de casillas conquistadas!.</p>
        </div>
        
        <div className="instruction-card">
          <h2>3. Acciones</h2>
          <p>Utiliza el oro para realizar acciones que te den una ventaja sobre tu rival!</p>
        </div>
        
        <div className="instruction-card">
          <h2>4. Poder Divino</h2>
          <p>Invoca a tu Dios para que te ayude en la partida!.</p>
        </div>
        
        <div className="back-button">
          <Link to="/">Volver al inicio</Link>
        </div>
      </main>
    </div>
  );
}

export default Instructions;