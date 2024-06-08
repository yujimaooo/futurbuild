import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
import './PromptPage.css';

function PromptPage() {
  const [income, setIncome] = useState(80000);
  const [savings, setSavings] = useState(40000);
  const [debt, setDebt] = useState(8000);

  return (
    <div className="prompt-page">
      <h1 className="title">Build your future.</h1>
      <p className="subtitle">Owning a house should be black and white.</p>
      <div className="prompt-container">
        <input
          type="text"
          className="prompt-input"
          placeholder="describe your dream home here..."
        />
        <button className="prompt-button">
          <FontAwesomeIcon icon={faHammer} />
        </button>
      </div>
      <div className="info-container">
        <div className="info-box">
          <span>Your Income:</span>
          $<input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="info-input"
          />
        </div>
        <div className="info-box">
          <span>Your Savings:</span>
          $<input
            type="number"
            value={savings}
            onChange={(e) => setSavings(e.target.value)}
            className="info-input"
          />
            </div>
            <div className="info-box">
          <span>Your Debt:</span>
          $<input
            type="number"
            value={debt}
            onChange={(e) => setDebt(e.target.value)}
            className="info-input"
          />
        </div>
      </div>
    </div>
  );
}

export default PromptPage;
