import React from 'react'
import bgVideo from '../assets/bg.mp4'; // Import the video file
import { Link } from 'react-router-dom';


const Hero = () => {
  return (
    <div>
      {/* Hero Section */}
      <div 
        className="hero-container mybg" 
        style={{ 
          position: 'relative', 
          height: '80vh', 
          overflow: 'hidden', 
          color: 'white' 
        }}>
        <video
          autoPlay
          loop
          muted
          style={{
            position: 'absolute',
            width: '100%',
            left: '50%',
            top: '50%',
            height: '100%',
            objectFit: 'cover',
            transform: 'translate(-50%, -50%)',
            zIndex: '-2'
          }}
        >
          <source src={bgVideo} type="video/mp4" />
        </video>
        {/* Video Overlay */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: '-1' }}></div>

        {/* Hero Content */}
        <div className="container h-100 d-flex flex-column justify-content-center align-items-center text-center">
          <h1 className="display-3 fw-bold">Quantum Financial Security</h1>
          <p className="lead my-4" style={{ maxWidth: '600px' }}>
            QFS portal to backup digital assets and funds for the global event and blackout coming soon!
          </p>
          <Link to="/login" className="btn btn-primary btn-lg rounded-pill px-4">Secure now</Link>
        </div>
      </div>
    </div>
  )
}

export default Hero
