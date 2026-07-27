import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/qfswhite.png';
import './Navbar.css';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#security', label: 'Security' },
  { href: '#portfolio', label: 'Reach' },
  { href: '#faq', label: 'FAQ' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="site-nav__inner">
        <Link className="site-nav__brand" to="/" onClick={closeMenu}>
          <img src={logo} alt="QFS logo" />
          <span>Quantum<em>FS</em></span>
        </Link>

        <ul className="site-nav__links">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="site-nav__actions">
          <Link to="/login" className="nav-btn-ghost">Sign in</Link>
          <Link to="/login" className="nav-btn-solid">Get started</Link>
        </div>

        <button
          className="site-nav__toggler"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          <span className="material-symbols-outlined">{menuOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      <div className={`site-nav__mobile ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>
        ))}
        <Link to="/login" className="nav-btn-ghost" onClick={closeMenu}>Sign in</Link>
        <Link to="/login" className="nav-btn-solid" onClick={closeMenu}>Get started</Link>
      </div>
    </nav>
  );
};

export default Navbar;
