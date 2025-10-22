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
          <h2 className="text-light">Put your money to good use</h2>
          <p className="text-light-emphasis">
            Dive deep into making your money work for you while you relax and watch netflix.
            Understand patterns, connect with people, and have fun playing games with people on this digital space.
          </p>
          <ul className="list-unstyled text-light mt-4">
            <li className="mb-3 d-flex align-items-start">
              <span className="material-symbols-outlined me-3 text-yellow-2">check_circle</span>
              <span>Real-time data visualization and Balance Updates.</span>
            </li>
            <li className="mb-3 d-flex align-items-start">
              <span className="material-symbols-outlined me-3 text-yellow-2">check_circle</span>
              <span>Customizable Avatars for your P2P Fights.</span>
            </li>
            <li className="mb-3 d-flex align-items-start">
              <span className="material-symbols-outlined me-3 text-yellow-2">check_circle</span>
              <span>Seamless Deposits and withdrawals At any Time or Day.</span>
            </li>
          </ul>
          <a href="#" className="btn btn-outline-light rounded-pill mt-3 px-4">Learn More</a>
        </div>
      </div>
    </div>
  )
}

export default Sec2
