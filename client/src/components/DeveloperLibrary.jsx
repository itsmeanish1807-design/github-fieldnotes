import API_BASE_URL from '../config/api';

import { useEffect, useState } from 'react';
import './DeveloperLibrary.css';

const API = `${API_BASE_URL}/api/library`;
function DeveloperLibrary({ profile, onSelectProfile }) {

    const [history, setHistory] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [activeTab, setActiveTab] = useState('history');
    const [loading, setLoading] = useState(false);

    // FETCH HISTORY AND FAVOURITES
    async function fetchLibrary() {
        try {
            const [historyResponse, favoritesResponse] =
                await Promise.all([
                    fetch(`${API}/history`),
                    fetch(`${API}/favorites`)
                ]);

            if (!historyResponse.ok || !favoritesResponse.ok) {
                throw new Error('Failed to load developer library');
            }

            const historyData = await historyResponse.json();
            const favoritesData = await favoritesResponse.json();

            setHistory(historyData);
            setFavorites(favoritesData);

        } catch (error) {
            console.error('Library Error:', error.message);
        }
    }

    // SAVE SUCCESSFULLY SEARCHED PROFILE
    useEffect(() => {
        if (!profile?.login) return;

        async function saveSearch() {
            try {
                await fetch(`${API}/history`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ profile })
                });

                fetchLibrary();

            } catch (error) {
                console.error('History Save Error:', error.message);
            }
        }

        saveSearch();

    }, [profile?.login]);

    // INITIAL LOAD
    useEffect(() => {
        fetchLibrary();
    }, []);

    // CHECK FAVOURITE STATUS
    const isFavorite = (username) => {
        return favorites.some(
            item => item.username === username.toLowerCase()
        );
    };

    // ADD OR REMOVE FAVOURITE
    async function toggleFavorite(developer) {
        const username = developer.username;

        try {
            if (isFavorite(username)) {
                await fetch(`${API}/favorites/${username}`, {
                    method: 'DELETE'
                });
            } else {
                await fetch(`${API}/favorites`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        profile: developer.profile
                    })
                });
            }

            fetchLibrary();

        } catch (error) {
            console.error('Favourite Error:', error.message);
        }
    }

    // REMOVE HISTORY ENTRY
    async function removeHistory(username) {
        try {
            await fetch(`${API}/history/${username}`, {
                method: 'DELETE'
            });

            fetchLibrary();

        } catch (error) {
            console.error(error);
        }
    }

    // CLEAR HISTORY
    async function clearHistory() {
        if (!window.confirm('Clear your entire search history?')) return;

        try {
            await fetch(`${API}/history`, {
                method: 'DELETE'
            });

            fetchLibrary();

        } catch (error) {
            console.error(error);
        }
    }

    const displayedItems =
        activeTab === 'history' ? history : favorites;

    return (
        <section className="developer-library">

            <div className="library-heading">
                <div>
                    <span className="section-label">YOUR COLLECTION</span>
                    <h2>Developer Library</h2>
                    <p>Your explored developers, all in one place.</p>
                </div>

                <div className="library-count">
                    <span>{history.length}</span>
                    <small>RECENT</small>
                </div>
            </div>

            <div className="library-tabs">

                <button
                    className={activeTab === 'history' ? 'active' : ''}
                    onClick={() => setActiveTab('history')}
                >
                    Search History
                    <span>{history.length}</span>
                </button>

                <button
                    className={activeTab === 'favorites' ? 'active' : ''}
                    onClick={() => setActiveTab('favorites')}
                >
                    Favourites
                    <span>{favorites.length}</span>
                </button>

            </div>

            <div className="library-toolbar">
                <span>
                    {activeTab === 'history'
                        ? 'RECENTLY EXPLORED'
                        : 'SAVED DEVELOPERS'}
                </span>

                {activeTab === 'history' && history.length > 0 && (
                    <button
                        className="clear-history"
                        onClick={clearHistory}
                    >
                        Clear history
                    </button>
                )}
            </div>

            <div className="developer-list">

                {displayedItems.length === 0 ? (

                    <div className="library-empty">
                        <span>⌕</span>
                        <h3>
                            {activeTab === 'history'
                                ? 'No search history yet'
                                : 'No favourites yet'}
                        </h3>
                        <p>
                            Explore GitHub developers to build your collection.
                        </p>
                    </div>

                ) : (

                    displayedItems.map((developer) => {

                        const user = developer.profile;

                        return (
                            <div
                                className="developer-row"
                                key={developer.username}
                            >

                                <img
                                    src={user.avatar_url}
                                    alt={developer.username}
                                />

                                <div className="developer-info">
                                    <h3>{user.name || developer.username}</h3>
                                    <span>@{developer.username}</span>
                                </div>

                                <div className="developer-actions">

                                    <button
                                        className="open-developer"
                                        onClick={() =>
                                            onSelectProfile(developer.username)
                                        }
                                    >
                                        Explore →
                                    </button>

                                    <button
                                        className={`favorite-button ${
                                            isFavorite(developer.username)
                                                ? 'selected'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            toggleFavorite(developer)
                                        }
                                        title="Toggle favourite"
                                    >
                                        {isFavorite(developer.username)
                                            ? '★'
                                            : '☆'}
                                    </button>

                                    {activeTab === 'history' && (
                                        <button
                                            className="remove-button"
                                            onClick={() =>
                                                removeHistory(developer.username)
                                            }
                                            title="Remove from history"
                                        >
                                            ×
                                        </button>
                                    )}

                                </div>

                            </div>
                        );
                    })

                )}

            </div>

        </section>
    );
}

export default DeveloperLibrary;