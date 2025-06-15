import { Link } from 'react-router-dom';
import './Home.css'; // Base styles
import './About.css'; // Specific styles

function About() {
  return (
    <div className="home-container">
      <main className="home-main">
        <h1 className="title">Sobre Nosotros</h1>
        <div className="about-content">
          <p className="about-text">
            Somos un grupo de 3 estudiantes del curso Tecnologías y Aplicaciones Web 
            de la Pontificia Universidad Católica de Chile.
          </p>
          
          <p className="about-text">
            Este proyecto fue desarrollado como parte de nuestro trabajo semestral, para 
            implementar los conocimientos adquiridos en el curso.
          </p>
          
          <div className="team-section">
            <h2>Nuestro Equipo</h2>
            <div className="team-members">
              {/* Aquí podrían ir fotos o avatares de los miembros del equipo */}
              <div className="team-member">Juan Antonio Moya Lagos</div>
              <div className="team-member">Benjamín Gastón Saldías Hoffmann</div>
              <div className="team-member">Cristobal Adolfo Tirado Morales</div>
            </div>
          </div>

          <div className="back-section">
            <Link to="/" className="back-link">Volver al Inicio</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default About;
