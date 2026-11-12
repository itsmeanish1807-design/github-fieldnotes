import API_BASE_URL from '../config/api';

import { useState } from 'react';
import './DeveloperFaceOff.css';

const API = `${API_BASE_URL}/api/github`;

function DeveloperFaceOff() {

    const [usernameA, setUsernameA] = useState('');
    const [usernameB, setUsernameB] = useState('');

    const [developerA, setDeveloperA] = useState(null);
    const [developerB, setDeveloperB] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function fetchDeveloper(username) {

        const encodedUsername = encodeURIComponent(username);

        const [profileResponse, statsResponse, reposResponse] =
            await Promise.all([

                fetch(`${API}/${encodedUsername}`),

                fetch(`${API}/${encodedUsername}/stats`),

                fetch(`${API}/${encodedUsername}/repos`)

            ]);

        const profile = await profileResponse.json();
        const stats = await statsResponse.json();
        const reposData = await reposResponse.json();

        if (!profileResponse.ok) {
            throw new Error(`Could not find ${username}`);
        }

        if (!statsResponse.ok) {
            throw new Error(`Could not fetch statistics for ${username}`);
        }

        if (!reposResponse.ok) {
            throw new Error(`Could not fetch repositories for ${username}`);
        }

        const repos = Array.isArray(reposData)
            ? reposData
            : reposData.enrichedRepos || [];

        // Aggregate language usage across the returned repositories.
        const languages = {};

        repos.forEach(repo => {

            if (!repo.languages) return;

            Object.entries(repo.languages).forEach(([language, bytes]) => {

                languages[language] =
                    (languages[language] || 0) + bytes;

            });

        });

        return {
            profile,
            stats,
            languages
        };
    }

    async function handleCompare(event) {

        event.preventDefault();

        if (!usernameA.trim() || !usernameB.trim()) {
            setError('Enter both GitHub usernames.');
            return;
        }

        if (usernameA.trim().toLowerCase() ===
            usernameB.trim().toLowerCase()) {

            setError('Choose two different developers.');
            return;
        }

        setLoading(true);
        setError('');

        setDeveloperA(null);
        setDeveloperB(null);

        try {

            const [dataA, dataB] = await Promise.all([

                fetchDeveloper(usernameA.trim()),
                fetchDeveloper(usernameB.trim())

            ]);

            setDeveloperA(dataA);
            setDeveloperB(dataB);

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    }

    const metrics = [
        {
            label: 'FOLLOWERS',
            key: 'followers'
        },
        {
            label: 'FOLLOWING',
            key: 'following'
        },
        {
            label: 'PUBLIC REPOSITORIES',
            key: 'publicRepos'
        },
        {
            label: 'TOTAL STARS',
            key: 'totalStars'
        },
        {
            label: 'TOTAL FORKS',
            key: 'totalForks'
        }
    ];

    function getWinner(valueA, valueB) {

        if (valueA > valueB) return 'A';
        if (valueB > valueA) return 'B';

        return 'TIE';
    }

    function formatNumber(value) {

        return Number(value || 0).toLocaleString('en-US');
    }

    const wins = developerA && developerB
        ? metrics.reduce((result, metric) => {

            const winner = getWinner(
                developerA.stats[metric.key],
                developerB.stats[metric.key]
            );

            if (winner === 'A') result.A++;
            if (winner === 'B') result.B++;

            return result;

        }, { A: 0, B: 0 })
        : null;

    const languageNames = developerA && developerB
        ? [...new Set([
            ...Object.keys(developerA.languages),
            ...Object.keys(developerB.languages)
        ])].sort((a, b) => {

            const totalA =
                developerA.languages[a] || 0;

            const totalB =
                developerB.languages[b] || 0;

            return (totalB - totalA);

        }).slice(0, 8)
        : [];

    return (

        <section className="faceoff">

            <div className="faceoff-heading">

                <span className="section-label">
                    DEVELOPER ARENA / 013
                </span>

                <h2>
                    Developer <span>Face-Off.</span>
                </h2>

                <p>
                    Two developers. One comparison.
                    Discover how their GitHub footprints differ.
                </p>

            </div>

            <form
                className="faceoff-search"
                onSubmit={handleCompare}
            >

                <div className="faceoff-input-group">

                    <label>DEVELOPER A</label>

                    <input
                        type="text"
                        placeholder="e.g. gaearon"
                        value={usernameA}
                        onChange={e => setUsernameA(e.target.value)}
                    />

                </div>

                <div className="versus">VS</div>

                <div className="faceoff-input-group">

                    <label>DEVELOPER B</label>

                    <input
                        type="text"
                        placeholder="e.g. sindresorhus"
                        value={usernameB}
                        onChange={e => setUsernameB(e.target.value)}
                    />

                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="compare-button"
                >
                    {loading ? 'COMPARING...' : 'COMPARE DEVELOPERS →'}
                </button>

            </form>

            {error && (

                <div className="faceoff-error">
                    {error}
                </div>

            )}

            {loading && (

                <div className="faceoff-loading">
                    ANALYSING DEVELOPER FOOTPRINTS...
                </div>

            )}

            {developerA && developerB && (

                <div className="faceoff-results">

                    {/* DEVELOPER PROFILES */}

                    <div className="faceoff-profiles">

                        {[developerA, developerB].map((developer, index) => (

                            <div
                                className="faceoff-profile"
                                key={developer.profile.login}
                            >

                                <img
                                    src={developer.profile.avatar_url}
                                    alt={developer.profile.login}
                                />

                                <span>
                                    DEVELOPER {index === 0 ? 'A' : 'B'}
                                </span>

                                <h3>
                                    {developer.profile.name ||
                                        developer.profile.login}
                                </h3>

                                <p>
                                    @{developer.profile.login}
                                </p>

                                <a
                                    href={developer.profile.html_url}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    VIEW GITHUB PROFILE ↗
                                </a>

                            </div>

                        ))}

                    </div>

                    {/* STATISTICS COMPARISON */}

                    <div className="comparison-section">

                        <h3>Performance Breakdown</h3>

                        {metrics.map(metric => {

                            const valueA = Number(
                                developerA.stats[metric.key] || 0
                            );

                            const valueB = Number(
                                developerB.stats[metric.key] || 0
                            );

                            const winner = getWinner(valueA, valueB);

                            const max = Math.max(valueA, valueB, 1);

                            return (

                                <div
                                    className="comparison-metric"
                                    key={metric.key}
                                >

                                    <div className="metric-values">

                                        <span className={
                                            winner === 'A' ? 'metric-winner' : ''
                                        }>
                                            {formatNumber(valueA)}
                                        </span>

                                        <label>{metric.label}</label>

                                        <span className={
                                            winner === 'B' ? 'metric-winner' : ''
                                        }>
                                            {formatNumber(valueB)}
                                        </span>

                                    </div>

                                    <div className="metric-bars">

                                        <div className="metric-track">
                                            <div
                                                className="metric-fill metric-fill-a"
                                                style={{
                                                    width: `${valueA / max * 100}%`
                                                }}
                                            />
                                        </div>

                                        <div className="metric-track">
                                            <div
                                                className="metric-fill metric-fill-b"
                                                style={{
                                                    width: `${valueB / max * 100}%`
                                                }}
                                            />
                                        </div>

                                    </div>

                                    <div className="metric-winner-label">

                                        {winner === 'TIE'
                                            ? 'DRAW'
                                            : `DEVELOPER ${winner} LEADS`}

                                    </div>

                                </div>

                            );

                        })}

                    </div>

                    {/* LANGUAGE COMPARISON */}

                    <div className="language-comparison">

                        <h3>Language Fingerprint</h3>

                        <p>
                            Aggregated bytes across the returned top repositories.
                        </p>

                        {languageNames.length === 0 ? (

                            <div className="language-empty">
                                Language data unavailable.
                            </div>

                        ) : (

                            languageNames.map(language => {

                                const valueA =
                                    developerA.languages[language] || 0;

                                const valueB =
                                    developerB.languages[language] || 0;

                                const max = Math.max(
                                    valueA,
                                    valueB,
                                    1
                                );

                                return (

                                    <div
                                        className="language-row"
                                        key={language}
                                    >

                                        <span>{language}</span>

                                        <div className="language-bars">

                                            <div className="language-track">
                                                <div
                                                    className="language-fill-a"
                                                    style={{
                                                        width: `${valueA / max * 100}%`
                                                    }}
                                                />
                                            </div>

                                            <div className="language-track">
                                                <div
                                                    className="language-fill-b"
                                                    style={{
                                                        width: `${valueB / max * 100}%`
                                                    }}
                                                />
                                            </div>

                                        </div>

                                    </div>

                                );

                            })

                        )}

                    </div>

                    {/* FINAL RESULT */}

                    <div className="faceoff-verdict">

                        <span>THE FACE-OFF RESULT</span>

                        <h3>

                            {wins.A > wins.B
                                ? developerA.profile.login
                                : wins.B > wins.A
                                    ? developerB.profile.login
                                    : 'IT’S A DRAW'}

                        </h3>

                        <p>

                            {wins.A > wins.B
                                ? `Developer A leads in ${wins.A} out of ${metrics.length} categories.`
                                : wins.B > wins.A
                                    ? `Developer B leads in ${wins.B} out of ${metrics.length} categories.`
                                    : 'Both developers lead in an equal number of categories.'}

                        </p>

                        <small>
                            Based on five GitHub metrics.
                            This is not an overall measure of developer skill.
                        </small>

                    </div>

                </div>

            )}

        </section>

    );
}

export default DeveloperFaceOff;