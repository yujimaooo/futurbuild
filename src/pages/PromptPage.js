import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './PromptPage.css';

function PromptPage() {
  const [income, setIncome] = useState(0);
  const [savings, setSavings] = useState(0);
  const [debt, setDebt] = useState(0);
  const [suburb, setSuburb] = useState("");
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/analyze', {
        prompt,
        income,
        savings,
        debt,
        suburb
      });

      console.log(response.data);  // Handle the response as needed
      navigate('/investment-analysis', { state: { analysis: response.data, initialData: { prompt, income, savings, debt, suburb } } });
    } catch (error) {
      console.error('Error sending prompt to the server:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prompt-page-landing">
      <h1 className="title-landing">Build your future.</h1>
      <p className="subtitle-landing">Owning a house should be black and white.</p>
      <div className="prompt-container-landing">
        <input
          type="text"
          className="prompt-input-landing"
          placeholder="describe what you want to build here..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button className="prompt-button-landing" onClick={handleNavigation} disabled={loading}>
          {loading ? (
            <div className="spinner"></div>
          ) : (
            <FontAwesomeIcon icon={faHammer} />
          )}
        </button>
      </div>
      <div className="info-container-landing">
        <div className="info-box-landing">
          <span>Your Income:</span>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="info-input-landing"
          />
        </div>
        <div className="info-box-landing">
          <span>Your Savings:</span>
          <input
            type="number"
            value={savings}
            onChange={(e) => setSavings(e.target.value)}
            className="info-input-landing"
          />
        </div>
        <div className="info-box-landing">
          <span>Your Debt:</span>
          <input
            type="number"
            value={debt}
            onChange={(e) => setDebt(e.target.value)}
            className="info-input-landing"
          />
        </div>
        <div className="info-box-landing">
          <span>Suburb to Build:</span>
          <input
            type="text"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            className="info-input-landing"
          />
        </div>
      </div>
    </div>
  );
}

export default PromptPage;
  