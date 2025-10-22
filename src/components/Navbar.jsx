import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/qfswhite.png'; // Ensure you have a logo image in the specified path
const Navbar = () => {
  return (
    <nav 
      className="navbar navbar-expand-lg navbar-dark sticky-top" 
      style={{ 
        backgroundColor: 'rgba(33, 37, 41, 0.13)', // Semi-transparent dark background
        backdropFilter: 'blur(10px)', 
        zIndex: '1000'
      }}
    >
      <div className="container-fluid">
        {/* Logo on the left */}
        <Link className="navbar-brand" to="/">
            <img src={logo} alt="Logo" width="50" height="50" className="d-inline-block align-top" />
        </Link>

        {/* Toggler for mobile view */}
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="material-symbols-outlined">
            sort
          </span>
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          {/* Hyperlinks in the middle */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link" href="#features">Features</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#faq">About</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#portfolio">Portfolio</a>
            </li>
          </ul>

          {/* Login button to the right */}
          <Link to="/login" className="btn btn-primary rounded-pill">Login</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar
