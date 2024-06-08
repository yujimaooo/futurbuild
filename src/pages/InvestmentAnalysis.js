import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHammer } from '@fortawesome/free-solid-svg-icons';
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
  const [locationInput, setLocationInput] = useState(initialData.location);
  const [priceRange, setPriceRange] = useState(initialData.priceRange);
  const [analysis, setAnalysis] = useState({});
  const [textAnalysis, setTextAnalysis] = useState("No analysis available");
  const [councilRegulations, setCouncilRegulations] = useState("No regulations information available");
  const [error, setError] = useState('');

  useEffect(() => {
    console.log("Location state:", state);
    console.log("Analysis data:", analysisData);
    if (analysisData.choices && analysisData.choices.length > 0 && analysisData.choices[0]?.message?.content) {
      try {
        const content = JSON.parse(analysisData.choices[0].message.content);
        console.log("Parsed content:", content); // Debug log
        if (content.analysis) {
          setAnalysis(content.analysis);
          setTextAnalysis(content.textAnalysis || "No analysis available");
          setCouncilRegulations(content.councilRegulations.replace(/\n/g, '<br>') || "No regulations information available");
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
      setError(''); // Clear previous errors
      const response = await axios.post('http://localhost:8000/analyze', {
        prompt,
        income,
        savings,
        debt,
        suburb: locationInput,
      });

      console.log(response.data);  // Handle the response as needed
      if (response.data.choices && response.data.choices.length > 0 && response.data.choices[0]?.message?.content) {
        try {
          const content = JSON.parse(response.data.choices[0].message.content);
          console.log("Parsed content:", content); // Debug log
          if (content.analysis) {
            setAnalysis(content.analysis);
            setTextAnalysis(content.textAnalysis || "No analysis available");
            setCouncilRegulations(content.councilRegulations.replace(/\n/g, '<br>') || "No regulations information available");
          } else {
            console.error("No analysis found in the content");
          }
        } catch (error) {
          console.error("Error parsing JSON content:", error);
          setError('Error parsing the response from the server.');
        }
      } else {
        console.error("Choices are not properly defined or message content is missing");
        setError('The server response was not properly defined.');
      }
    } catch (error) {
      console.error('Error sending prompt to the server:', error);
      setError('Error sending the request to the server.');
    }
  };

  return (
    <div className="investment-analysis-page">
      <div className="left-section">
        <div className="prompt-section">
          <div className="prompt-container">
            <input
              type="text"
              className="prompt-input"
              placeholder="describe what you want to build here..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button className="prompt-button" onClick={handleRegenerate}>
              <FontAwesomeIcon icon={faHammer} />
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
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
            <div className="info-box">
              <span>Suburb:</span>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className="info-input"
              />
            </div>

          </div>
          <div className="info-tiles">
            <div className="info-tile">
              <h3>Loan Amount</h3>
              <p>${analysis.loanAmount ? analysis.loanAmount.toLocaleString() : 'N/A'}</p>
            </div>
            <div className="info-tile">
              <h3>Total Project Cost</h3>
              <p>${analysis.totalProjectCost ? analysis.totalProjectCost.toLocaleString() : 'N/A'}</p>
            </div>
            <div className="info-tile">
              <h3>Annual Interest Rate</h3>
              <p>{analysis.annualInterestRate ? parseFloat(analysis.annualInterestRate).toFixed(2) : 'N/A'}%</p>
            </div>
            <div className="info-tile">
              <h3>Monthly Repayments</h3>
              <p>${analysis.monthlyRepayment ? analysis.monthlyRepayment.toLocaleString() : 'N/A'}</p>
            </div>
            <div className="info-tile">
              <h3>Cost Variation</h3>
              <p>${analysis.costVariation ? analysis.costVariation.toLocaleString() : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="right-section">
        <div className="text-analysis">
          <p>{textAnalysis}</p>
        </div>
        <div className="council-analysis">
          <h3>Council Regulations</h3>
          <p dangerouslySetInnerHTML={{ __html: councilRegulations }} />
        </div>
      </div>
    </div>
  );
}

export default InvestmentAnalysis;
