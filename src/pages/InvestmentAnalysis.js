import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import './InvestmentAnalysis.css';

function InvestmentAnalysis() {
  const location = useLocation();
  const state = location.state || {};
  const analysisData = state.analysis || {};
  const initialData = state.initialData || {};

  const [prompt, setPrompt] = useState(initialData.prompt);
  const [income, setIncome] = useState(initialData.income);
  const [savings, setSavings] = useState(initialData.savings);
  const [debt, setDebt] = useState(initialData.debt);
  const [analysis, setAnalysis] = useState({});
  const [textAnalysis, setTextAnalysis] = useState("No analysis available");
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {
    console.log("Location state:", state);
    console.log("Analysis data:", analysisData);
    if (analysisData.choices && analysisData.choices.length > 0 && analysisData.choices[0]?.message?.content) {
      try {
        const content = JSON.parse(analysisData.choices[0].message.content);
        console.log("Parsed content:", content);
        if (content.analysis) {
          setAnalysis(content.analysis);
          setTextAnalysis(content.textAnalysis || "No analysis available");
        } else {
          console.error("No analysis found in the content");
        }
      } catch (error) {
        console.error("Error parsing JSON content:", error);
      }
    } else {
      console.error("Choices are not properly defined or message content is missing");
    }
  }, [state, analysisData]);

  const handleRegenerate = async () => {
    try {
      const response = await axios.post('http://localhost:8000/analyze', {
        prompt,
        income,
        savings,
        debt
      });

      console.log(response.data);
      if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0]?.message?.content) {
        try {
          const content = JSON.parse(response.data.choices[0].message.content);
          console.log("Parsed content:", content);
          if (content.analysis) {
            setAnalysis(content.analysis);
            setTextAnalysis(content.textAnalysis || "No analysis available");
          } else {
            console.error("No analysis found in the content");
          }
        } catch (error) {
          console.error("Error parsing JSON content:", error);
        }
      } else {
        console.error("Choices are not properly defined or message content is missing");
      }
    } catch (error) {
      console.error('Error sending prompt to the server:', error);
    }
  };

  const handleShowFloorPlan = () => {
    setIsPopupVisible(true);
  };

  const handleClosePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div className="investment-analysis-page">
      <div className="header">
      </div>
      <div className="content">
        <div className="left-section">
          <div className="prompt-section">
            <div className="prompt-container">
              <input
                type="text"
                className="prompt-input"
                placeholder="describe your dream home here..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <button className="prompt-button" onClick={handleRegenerate}>
                <FontAwesomeIcon icon={faHammer} />
              </button>
            </div>
            <div className="info-container">
              <div className="info-box">
                <span>Your Income:</span>
                <input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="info-input"
                />
              </div>
              <div className="info-box">
                <span>Your Savings:</span>
                <input
                  type="number"
                  value={savings}
                  onChange={(e) => setSavings(e.target.value)}
                  className="info-input"
                />
              </div>
              <div className="info-box">
                <span>Your Debt:</span>
                <input
                  type="number"
                  value={debt}
                  onChange={(e) => setDebt(e.target.value)}
                  className="info-input"
                />
              </div>
            </div>
            <div className="info-tiles">
              <div className="info-tile">
                <h3>Loan Recommendation</h3>
                <p>{analysis.loanRecommendation}</p>
              </div>
              <div className="info-tile">
                <h3>Interest Rate</h3>
                <p>{analysis.interestRate}%</p>
              </div>
              <div className="info-tile">
                <h3>Financial Health</h3>
                <p>{analysis.financialHealth}</p>
              </div>
              <div className="info-tile">
                <h3>Risk Assessment</h3>
                <p>{analysis.riskAssessment}</p>
              </div>
              <div className="info-tile">
                <h3>Down Payment Capability</h3>
                <p>{analysis.downPaymentCapability}</p>
              </div>
              <div className="info-tile">
                <h3>Debt-to-Income Ratio</h3>
                <p>{analysis.debtToIncomeRatio}%</p>
              </div>
            </div>
          </div>
        </div>
        <div className="right-section">
        <button className="floor-plan-button" onClick={handleShowFloorPlan}>
          Show 2D Floor Plan
        </button>
          <div className="text-analysis">
            <p>{textAnalysis}</p>
          </div>
        </div>
      </div>
      {isPopupVisible && (
        <div className="popup">
          <div className="popup-content">
            <button className="close-button" onClick={handleClosePopup}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="floor-plan">
              {/* Insert your 2D floor plan content here */}
              <p>2D Floor Plan will be displayed here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default InvestmentAnalysis;
