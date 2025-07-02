import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from '../pages/Register';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Matches from '../pages/Matches';
import MatchCreate from '../pages/MatchCreate';
import MatchDetail from '../pages/MatchDetail';
import Lobby from '../pages/Lobby';
import Instructions from '../pages/Instructions';
import About from '../pages/About';
import GameOver from '../pages/GameOver';

function Routing() {
  return (
    
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/matches/:id/lobby" element={<Lobby />} />
        <Route path="/matches/:matchId/gameover" element={<GameOver />} />
        <Route path="/instructions" element={<Instructions />} />
        <Route path="/about" element={<About />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/create-match" element={<MatchCreate />} />
        <Route path="/matches/:id" element={<MatchDetail />} />
        <Route path="*" element={<h2>Página no encontrada</h2>} />
      </Routes>
    
  );
}

export default Routing;
