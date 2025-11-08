import { useState } from 'react';
import { ideasAPI } from '../services/api';

function Home() {
  const [language, setLanguage] = useState('');
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState(null);
  const [trends, setTrends] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerateIdeas = async () => {
    console.log('🚀 [Frontend] Generate Ideas button clicked');
    console.log('🚀 [Frontend] Parameters:', { language, days });
    setLoading(true);
    setError(null);

    try {
      console.log('📤 [Frontend] Sending request to API...');
      const response = await ideasAPI.generateIdeas(language, days);
      console.log('📥 [Frontend] Received response:', response);

      if (response.data.success) {
        setIdeas(response.data.data.ideas);
        setTrends(response.data.data.trends);
      }
    } catch (err) {
      console.error('❌ [Frontend] Error occurred:', err);
      console.error('❌ [Frontend] Error response:', err.response);
      console.error('❌ [Frontend] Error message:', err.message);
      setError(err.response?.data?.error || 'Failed to generate ideas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Open Source Project Idea Generator</h1>
        <p>Discover innovative project ideas based on GitHub trends</p>
      </header>

      <div className="controls">
        <div className="form-group">
          <label htmlFor="language">Programming Language (optional)</label>
          <input
            id="language"
            type="text"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="e.g., javascript, python, rust"
          />
        </div>

        <div className="form-group">
          <label htmlFor="days">Time Range (days)</label>
          <select
            id="days"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>

        <button
          onClick={handleGenerateIdeas}
          disabled={loading}
          className="generate-btn"
        >
          {loading ? 'Generating...' : 'Generate Ideas'}
        </button>
      </div>

      {error && (
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {trends && (
        <div className="trends-section">
          <h2>Current Trends</h2>

          <div className="trend-category">
            <h3>Top Topics</h3>
            <div className="tags">
              {trends.topics.map(([topic, count]) => (
                <span key={topic} className="tag">
                  {topic} ({count})
                </span>
              ))}
            </div>
          </div>

          <div className="trend-category">
            <h3>Popular Languages</h3>
            <div className="tags">
              {trends.languages.map(([lang, count]) => (
                <span key={lang} className="tag">
                  {lang} ({count})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {ideas && (
        <div className="ideas-section">
          <h2>Generated Project Ideas</h2>

          {ideas.rawResponse ? (
            <div className="raw-response">
              <pre>{ideas.rawResponse}</pre>
            </div>
          ) : Array.isArray(ideas) ? (
            <div className="ideas-grid">
              {ideas.map((idea, index) => (
                <div key={index} className="idea-card">
                  <h3>{idea['Project Name'] || idea.name || `Idea ${index + 1}`}</h3>
                  <p className="description">
                    {idea.Description || idea.description}
                  </p>

                  {idea['Target Audience'] && (
                    <p className="audience">
                      <strong>Target:</strong> {idea['Target Audience']}
                    </p>
                  )}

                  {idea['Key Features'] && (
                    <div className="features">
                      <strong>Key Features:</strong>
                      <ul>
                        {(Array.isArray(idea['Key Features'])
                          ? idea['Key Features']
                          : [idea['Key Features']]
                        ).map((feature, i) => (
                          <li key={i}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {idea['Tech Stack suggestion'] && (
                    <p className="tech-stack">
                      <strong>Tech Stack:</strong> {idea['Tech Stack suggestion']}
                    </p>
                  )}

                  {idea['Why it\'s needed'] && (
                    <p className="why-needed">
                      <strong>Market Gap:</strong> {idea['Why it\'s needed']}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No ideas generated yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
