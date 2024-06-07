import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
import './PromptPage.css';

function PromptPage() {
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
        <div className="info-box">Your Income: <span>$80,000</span></div>
        <div className="info-box">Your Savings: <span>$40,000</span></div>
        <div className="info-box">Your Debt: <span>$8,000</span></div>
      </div>
    </div>
  );
}

export default PromptPage;
