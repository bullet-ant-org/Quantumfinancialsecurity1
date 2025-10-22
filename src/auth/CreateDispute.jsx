import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateTicket.css'; // Reusing styles for consistency

const ProgressBar = ({ step, totalSteps }) => {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

const CreateDispute = () => {
  const [step, setStep] = useState(1);
  const location = useLocation();
  const [formData, setFormData] = useState({
    transactionId: '',
    title: '',
    priority: 'medium',
    description: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.transactionId) {
      setFormData(prev => ({ ...prev, transactionId: location.state.transactionId }));
      setStep(2); // Skip to the next step since we have the ID
    }
  }, [location.state]);

  const totalSteps = 5;
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && !formData.transactionId) {
      setError('Please provide the Transaction ID.');
      return;
    }
    if (step === 2 && !formData.title) {
      setError('Please provide a reason for the dispute.');
      return;
    }
    if (step === 4 && !formData.description) {
      setError('Please provide a detailed description.');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/disputes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create dispute.');
      navigate('/user/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="form-step active">
            <h2>Which transaction are you disputing?</h2>
            <p>Please enter the ID of the transaction in question.</p>
            <input type="text" name="transactionId" value={formData.transactionId} onChange={handleChange} placeholder="Transaction ID" className="form-control-ticket" autoFocus />
          </div>
        );
      case 2:
        return (
          <div className="form-step active">
            <h2>What is the reason for this dispute?</h2>
            <p>Provide a short title for your dispute.</p>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., 'Incorrect amount charged'" className="form-control-ticket" autoFocus />
          </div>
        );
      case 3:
        return (
          <div className="form-step active">
            <h2>What is the priority of this dispute?</h2>
            <p>This helps us understand the urgency.</p>
            <div className="select-group">
              <label>Priority</label>
              <select name="priority" value={formData.priority} onChange={handleChange} className="form-control-ticket">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="form-step active">
            <h2>Describe the dispute in detail</h2>
            <p>Provide all relevant information to help us resolve this quickly.</p>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Explain what happened, what you expected, and any other details." className="form-control-ticket" rows="6"></textarea>
          </div>
        );
      case 5:
        return (
          <div className="form-step active">
            <h2>Review your dispute</h2>
            <div className="review-details">
              <p><strong>Transaction ID:</strong> {formData.transactionId}</p>
              <p><strong>Reason:</strong> {formData.title}</p>
              <p><strong>Priority:</strong> {formData.priority}</p>
              <p><strong>Description:</strong> {formData.description}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="create-ticket-page">
      <div className="ticket-form-container">
        <h1 className="ticket-title">File a New Dispute</h1>
        <ProgressBar step={step} totalSteps={totalSteps} />
        <form onSubmit={handleSubmit}>
          {error && <div className="ticket-error-message">{error}</div>}
          {renderStep()}
          <div className="navigation-buttons">
            {step > 1 && <button type="button" onClick={prevStep} className="btn-ticket-secondary">Back</button>}
            {step < totalSteps && <button type="button" onClick={nextStep} className="btn-ticket-primary">Continue</button>}
            {step === totalSteps && (
              <button type="submit" disabled={loading} className="btn-ticket-primary">
                {loading ? 'Submitting...' : 'Submit Dispute'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDispute;