import React, { useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { debounce, throttle } from 'lodash';

function App() {
  const [url, setUrl] = useState('');
  const [expiry, setExpiry] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [stats, setStats] = useState(null);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';


  //Debouncing
  const shorten = useCallback(
    debounce(async () => {
      if (!url) return;
      try {
        const body = { originalUrl: url };
        if (expiry) body.expiresAt = Number(expiry);

        const res = await fetch(`${baseUrl}/api/shorten`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (!res.ok) throw new Error('Server Error');

        const data = await res.json();
        setShortUrl(data.shortUrl);
        setStats(null);
        toast.success('URL shortened successfully!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to shorten URL');
      }
    }, 500),
    [url, expiry]
  );

  // Throttling
  const fetchStats = useCallback(
    throttle(async () => {
      if (!shortUrl) return toast.error('Shorten a URL first!');
      try {
        const shortCode = shortUrl.split('/').pop();
        const res = await fetch(`${baseUrl}/api/statistics/${shortCode}`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
        toast.success('Stats fetched!');
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch stats');
      }
    }, 2000),
    [shortUrl]
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <Toaster position="top-right" />
      <h2>🔗 URL Shortener</h2>

      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Enter a long URL"
        style={{ width: '300px', marginRight: '10px', padding: '6px' }}
      />
      <input
        type="number"
        value={expiry}
        onChange={(e) => setExpiry(e.target.value)}
        placeholder="Expiry (minutes)"
        style={{ width: '150px', marginRight: '10px', padding: '6px' }}
      />
      <button onClick={shorten} style={{ marginRight: '10px' }}>
        Shorten
      </button>

      {shortUrl && (
        <div style={{ marginTop: '1rem' }}>
          <p>
            Shortened URL: <a href={shortUrl} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
          </p>
          <button onClick={fetchStats}>Get Statistics</button>
        </div>
      )}

      {stats && (
        <div style={{ marginTop: '1rem' }}>
          <h3>📊 URL Statistics</h3>
          <ul>
            <li><strong>Original URL:</strong> {stats.originalUrl}</li>
            <li><strong>Short Code:</strong> {stats.shortCode}</li>
            <li><strong>Created At:</strong> {new Date(stats.createdAt).toLocaleString()}</li>
            <li><strong>Click Count:</strong> {stats.clickCount}</li>
            <li><strong>Expires At:</strong> {stats.expiresAt === 'Never' ? 'Never' : new Date(stats.expiresAt).toLocaleString()}</li>
            {stats.expired && <li style={{ color: 'red' }}>Status: Expired ❌</li>}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
