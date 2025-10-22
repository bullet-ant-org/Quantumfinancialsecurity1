import React from 'react'
import { FaLock, FaKey, FaShieldAlt } from 'react-icons/fa';

const Schemes = () => {
  return (
    <div className="container mt-5">
      <div className="row">
        {/* First Container */}
        <div className="col-md-4 mb-3">
          <div className="card rounded-var p-4">
            <span className="material-symbols-outlined edit">
fingerprint
</span>
            <h4>Secure Wallet</h4>
            <p>Best for security because it comes with the strongest security features & track record of any cryptoo online wallet.</p>
          </div>
        </div>
        {/* Second Container */}
        <div className="col-md-4 mb-3">
          <div className="card rounded-var p-4">
            <span className="material-symbols-outlined edit">
payments
</span>
            <h4>Multi Currency Support</h4>
            <p>Multi-currency support means that shoppers can pay for your products or services using the currency.</p>
          </div>
        </div>
        {/* Third Container */}
        <div className="col-md-4 mb-3">
          <div className="card rounded-var p-4">
            <span className="material-symbols-outlined edit">
concierge
</span>
            <h4>24/7 Live Support</h4>
            <p>When you need help, our team of experts will work with you via our 24/7 live chat to reach a quick & efficient.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Schemes
