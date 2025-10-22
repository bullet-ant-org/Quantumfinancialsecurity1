import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CreateTicket.css';

const ProgressBar = ({ step, totalSteps }) => {
  const progress = (step / totalSteps) * 100;
  return (
    <div className="progress-bar-container">
      <div className="progress-bar" style={{ width: `${progress}%` }}></div>
    </div>
  );
};

const CreateTicket = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    category: 'general',
    priority: 'medium',
    description: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const totalSteps = 4;
  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => {
    if (step === 1 && !formData.title) {
      setError('Please provide a title for your ticket.');
      return;
    }
    if (step === 3 && !formData.description) {
      setError('Please provide a description.');
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
      const res = await fetch(`${apiUrl}/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create ticket.');
      navigate('/user/dashboard'); // Or a ticket success page
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
            <h2>What is the issue about?</h2>
            <p>Provide a concise title for your support ticket.</p>
            <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., 'Transaction failed'" className="form-control-ticket" autoFocus />
          </div>
        );
      case 2:
        return (
          <div className="form-step active">
            <h2>Categorize your issue</h2>
            <p>This helps us route your ticket to the right team.</p>
            <div className="select-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange} className="form-control-ticket">
                <option value="general">General Inquiry</option>
                <option value="technical">Technical Issue</option>
                <option value="billing">Billing Question</option>
                <option value="feedback">Feedback</option>
              </select>
            </div>
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
      case 3:
        return (
          <div className="form-step active">
            <h2>Describe your issue in detail</h2>
            <p>The more details you provide, the faster we can help.</p>
            <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Please include any relevant details, transaction IDs, or error messages." className="form-control-ticket" rows="6"></textarea>
          </div>
        );
      case 4:
        return (
          <div className="form-step active">
            <h2>Review your ticket</h2>
            <div className="review-details">
              <p><strong>Title:</strong> {formData.title}</p>
              <p><strong>Category:</strong> {formData.category}</p>
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
        <h1 className="ticket-title">Submit a New Ticket</h1>
        <ProgressBar step={step} totalSteps={totalSteps} />
        <form onSubmit={handleSubmit}>
          {error && <div className="ticket-error-message">{error}</div>}
          {renderStep()}
          <div className="navigation-buttons">
            {step > 1 && <button type="button" onClick={prevStep} className="btn-ticket-secondary">Back</button>}
            {step < totalSteps && <button type="button" onClick={nextStep} className="btn-ticket-primary">Continue</button>}
            {step === totalSteps && (
              <button type="submit" disabled={loading} className="btn-ticket-primary">
                {loading ? 'Submitting...' : 'Submit Ticket'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTicket;