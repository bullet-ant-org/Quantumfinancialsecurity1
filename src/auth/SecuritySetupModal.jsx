import React, { useState, useEffect } from 'react';
import './SecuritySetupModal.css';

const securitySteps = [
  {
    title: 'Establishing Secure Quantum Link...',
    duration: 6000,
    logs: [
      'Initializing quantum-resistant cryptographic keys...',
      'Authenticating with QFS mainnet...',
      'Generating entanglement pairs...',
      'Secure link established. Protocol: Q-AES-512.',
    ],
  },
  {
    title: 'Backing Up to Decentralized Ledger...',
    duration: 6500,
    logs: [
      'Hashing user credentials with SHA-3...',
      'Broadcasting transaction to network nodes...',
      'Awaiting consensus (3/5 nodes confirmed)...',
      'Consensus reached. Writing to immutable block...',
      'User data secured on blockchain.',
    ],
  },
  {
    title: 'Finalizing Account Security Matrix...',
    duration: 6500,
    logs: [
      'Activating multi-spectral biometric authentication...',
      'Deploying real-time threat monitoring daemon...',
      'Calibrating neural network for anomaly detection...',
      'Security matrix complete. Account is fully protected.',
    ],
  },
];

const SecuritySetupModal = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [displayedLogs, setDisplayedLogs] = useState([]);

  useEffect(() => {
    const step = securitySteps[currentStep];
    if (!step) {
      onClose();
      return;
    }

    // Animate logs for the current step
    const logInterval = setInterval(() => {
      setDisplayedLogs(prev => {
        if (prev.length < step.logs.length) {
          return [...prev, step.logs[prev.length]];
        }
        return prev;
      });
    }, step.duration / (step.logs.length + 1));

    // Move to next step
    const stepTimeout = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setDisplayedLogs([]);
    }, step.duration);

    return () => {
      clearInterval(logInterval);
      clearTimeout(stepTimeout);
    };
  }, [currentStep, onClose]);

  const step = securitySteps[currentStep];
  const progress = ((currentStep + 1) / securitySteps.length) * 100;

  return (
    <div className="security-modal-overlay">
      <div className="security-modal-container">
        <div className="security-modal-header">
          <span className="material-symbols-outlined">shield_lock</span>
          <h3>Securing Your Account</h3>
        </div>
        <div className="security-modal-content">
          <div className="progress-bar-container-outer">
            <div className="progress-bar-inner" style={{ width: `${progress}%` }}></div>
          </div>
          <h4 className="step-title">{step?.title || 'Finalizing...'}</h4>
          <div className="logs-container">
            {displayedLogs.map((log, index) => (
              <p key={index} className="log-entry">{`> ${log}`}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySetupModal;