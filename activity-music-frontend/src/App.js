import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "./App.css";

function App() {
  const [activity, setActivity] = useState("walking");
  const [includeBollywood, setIncludeBollywood] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  const loginWithSpotify = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/login");
      if (response.data?.url) {
        window.location.href = response.data.url;
      } else {
        throw new Error("Invalid response from backend");
      }
    } catch {
      setError("Failed to initiate Spotify login");
    }
  };

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");

    if (code) {
      axios
        .get(`http://127.0.0.1:8000/callback?code=${code}`)
        .then(() => {
          window.history.replaceState({}, document.title, "/");
          alert("Login successful! You can now get recommendations.");
        })
        .catch(() => {
          setError("Failed to authenticate with Spotify.");
        });
    }
  }, []);

  const fetchRecommendations = async () => {
    setError("");
    setRecommendations([]);

    try {
      const response = await axios.get("http://127.0.0.1:8000/recommendations", {
        params: { activity, include_bollywood: includeBollywood },
      });
      setRecommendations(response.data.recommendations);
    } catch {
      setError("Failed to fetch recommendations. Ensure you are logged in to Spotify.");
    }
  };

  const makePlaylist = async () => {
    const playlistName = `My ${activity.charAt(0).toUpperCase() + activity.slice(1)} Playlist`;
    const trackUris = recommendations.map((rec) => rec.uri);

    try {
      const response = await axios.post("http://127.0.0.1:8000/create_playlist", {
        playlist_name: playlistName,
        track_uris: trackUris,
      });

      alert("Playlist created successfully!");
      window.location.href = response.data.url;
    } catch {
      setError("Failed to create playlist. Ensure you are logged in to Spotify.");
    }
  };

  return (
    <motion.div
      className="App"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <header>
        <motion.h1 whileHover={{ scale: 1.1 }}>🎵 Spotify Song Recommender</motion.h1>
      </header>

      <main>
        <div className="actions">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="login-btn"
            onClick={loginWithSpotify}
          >
            Login with Spotify
          </motion.button>
        </div>

        <motion.div
          className="form"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <label>
            Activity Type:
            <select value={activity} onChange={(e) => setActivity(e.target.value)}>
              <option value="walking">🚶 Walking</option>
              <option value="running">🏃 Running</option>
              <option value="sitting">🪑 Sitting</option>
              <option value="exercising">💪 Exercising</option>
              <option value="driving">🚗 Driving</option>
            </select>
          </label>

          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={includeBollywood}
              onChange={(e) => setIncludeBollywood(e.target.checked)}
            />
            Include Bollywood Songs 🇮🇳
          </label>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={fetchRecommendations}
            className="fetch-btn"
          >
            🎶 Get Recommendations
          </motion.button>
        </motion.div>

        {error && <p className="error">{error}</p>}

        <div className="recommendations">
          {recommendations.length > 0 && <h2>Recommended Songs:</h2>}
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {recommendations.map((rec, index) => (
              <motion.li
                key={index}
                className="song-item"
                whileHover={{ scale: 1.02, boxShadow: "0px 4px 10px rgba(0,0,0,0.2)" }}
              >
                <div className="song-info">
                  <img src={rec.album_art} alt={`${rec.name} album art`} />
                  <div className="details">
                    <a href={rec.url} target="_blank" rel="noopener noreferrer">
                      <strong>{rec.name}</strong>
                    </a>
                    <p>By: {rec.artist}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>

          {recommendations.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={makePlaylist}
              className="make-playlist-btn"
            >
              🎵 Make Playlist
            </motion.button>
          )}
        </div>
      </main>

      <footer>
        <p>Powered by Spotify 🎧</p>
      </footer>
    </motion.div>
  );
}

export default App;
