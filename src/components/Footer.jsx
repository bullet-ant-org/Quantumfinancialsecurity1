import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/qfswhite.png';
import './Footer.css';

const Footer = () => {
  return (
    <>
      <section className="deneb_cta" id="cta">
        <div className="container">
          <div className="cta_wrapper" style={{ backgroundImage: "url(http://demo.tortoizthemes.com/deneb-html/deneb-ltr/assets/images/cta_bg.png)" }}>
            <div className="row align-items-center justify-content-center">
              <div className="col-md-10">
                <div className="cta_content text-center">
                  <h3>Ready to Get Started?</h3>
                  <p>Join thousands of users who trust our platform for secure and efficient financial management.</p>
                  <Link to="/login" className="btn btn-primary">Create an Account</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="deneb_footer">
        <div className="widget_wrapper">
          <div className="container">
            <div className="row">
              <div className="col-lg-4 col-md-12">
                <div className="widget widegt_about">
                  <div className="widget_title">
                    <img src={logo} className="img-fluid" alt="logo" style={{width: '120px'}}/>
                  </div>
                  <p>Our mission is to provide a secure, transparent, and efficient financial ecosystem for the modern world. We leverage cutting-edge technology to empower our users.</p>
                  <ul className="social">
                    <li><a href="#" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a></li>
                    <li><a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a></li>
                    <li><a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a></li>
                    <li><a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a></li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-2 col-md-4 col-sm-6">
                <div className="widget widget_link">
                  <div className="widget_title">
                    <h4>Company</h4>
                  </div>
                  <ul>
                    <li><a href="/#features">Features</a></li>
                    <li><a href="/#faq">About</a></li>
                    <li><a href="/#portfolio">Portfolio</a></li>
                    <li><Link to="/login">Login</Link></li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-3 col-md-4 col-sm-6">
                <div className="widget widget_link">
                  <div className="widget_title">
                    <h4>Legal & Support</h4>
                  </div>
                  <ul>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Support Center</a></li>
                    <li><a href="#">FAQ</a></li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-3 col-md-4 col-sm-12">
                <div className="widget widget_contact">
                  <div className="widget_title">
                    <h4>Contact Us</h4>
                  </div>
                  <div className="contact_info">
                    <p><a href="mailto:support@qfs.com">support@qfs.com</a></p>
                    <p><a href="tel:1-800-123-4567">1-800-123-4567</a></p>
                    <p>123 Finance St, New York, NY</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="copyright_area">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <div className="copyright_text">
                  <p>Copyright &copy; {new Date().getFullYear()} QFS Platform. All rights reserved.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer
