import React from 'react'
import Emoji from '../assets/bitcoin.jpg'

const Sec2 = () => {
  return (
    <div className="container mt-5 mb-5">
      <div className="row align-items-center">
        <div className="col-lg-6 mb-4 mb-lg-0">
          {/* You can replace this with an <img /> tag */}
          <div className="imoji"><img src={Emoji} alt="" /></div>
          
        </div>
        <div className="col-lg-6 ps-lg-5">
          <h2 className="text-light">Secure, Seamless Banking on the Ethereum Blockchain</h2>
          <p className="text-light-emphasis">
            Take full control of your digital assets with the unparalleled security of the Ethereum blockchain. Our platform provides a direct, transparent, and secure gateway to manage your finances without traditional intermediaries.
          </p>
          <ul className="list-unstyled text-light mt-4">
            <li className="mb-3 d-flex align-items-start">
              <span className="material-symbols-outlined me-3 text-yellow-2">check_circle</span>
              <span>Instantly track your portfolio with real-time balance updates directly from the Ethereum network.</span>
            </li>
            <li className="mb-3 d-flex align-items-start">
              <span className="material-symbols-outlined me-3 text-yellow-2">check_circle</span>
              <span>Benefit from world-class security, where only you have access to your funds via your private wallet.</span>
            </li>
            <li className="mb-3 d-flex align-items-start">
              <span className="material-symbols-outlined me-3 text-yellow-2">check_circle</span>
              <span>Enjoy the freedom of the blockchain with 24/7 access to your funds, free from traditional banking hours.</span>
            </li>
          </ul>
          <a href="#" className="btn btn-outline-light rounded-pill mt-3 px-4">Learn More</a>
        </div>
      </div>
    </div>
  )
}

export default Sec2
