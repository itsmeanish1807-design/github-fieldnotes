import API_BASE_URL from './config/api';

import DeveloperFaceOff from './components/DeveloperFaceOff';

import { useState } from 'react';
import './App.css';

import SearchBar from './components/SearchBar';
import ProfileCard from './components/ProfileCard';
import RepoList from './components/RepoList';
import LanguageFingerprint from './components/LanguageFingerprint';
import StatsDashboard from './components/StatsDashboard';
import ActivityTimeline from './components/ActivityTimeline';
import DeveloperLibrary from './components/DeveloperLibrary';


/* =================================
   LOADING SKELETON
================================= */

function LoadingSkeleton() {

    return (

        <div className="loading-skeleton" aria-label="Loading developer profile">

            {/* PROFILE SKELETON */}

            <div className="skeleton-profile">

                <div className="skeleton-avatar shimmer"></div>

                <div className="skeleton-profile-info">

                    <div className="skeleton-line skeleton-name shimmer"></div>

                    <div className="skeleton-line skeleton-username shimmer"></div>

                    <div className="skeleton-line skeleton-bio shimmer"></div>

                </div>

            </div>


            {/* STATISTICS SKELETON */}

            <div className="skeleton-stats">

                {[1, 2, 3, 4].map((item) => (

                    <div className="skeleton-stat shimmer" key={item}>
                        <div className="skeleton-line skeleton-stat-number"></div>
                        <div className="skeleton-line skeleton-stat-label"></div>
                    </div>

                ))}

            </div>


            {/* REPOSITORY SKELETON */}

            <div className="skeleton-section">

                <div className="skeleton-heading shimmer"></div>

                <div className="skeleton-repo-grid">

                    {[1, 2, 3, 4].map((item) => (

                        <div className="skeleton-repo shimmer" key={item}>

                            <div className="skeleton-line skeleton-repo-title"></div>

                            <div className="skeleton-line skeleton-repo-description"></div>

                            <div className="skeleton-line skeleton-repo-description short"></div>

                        </div>

                    ))}

                </div>

            </div>


            {/* LANGUAGE SKELETON */}

            <div className="skeleton-section">

                <div className="skeleton-heading shimmer"></div>

                {[1, 2, 3].map((item) => (

                    <div className="skeleton-language" key={item}>

                        <div className="skeleton-line skeleton-language-label shimmer"></div>

                        <div className="skeleton-language-track shimmer"></div>

                    </div>

                ))}

            </div>


            {/* ACTIVITY SKELETON */}

            <div className="skeleton-section">

                <div className="skeleton-heading shimmer"></div>

                {[1, 2, 3].map((item) => (

                    <div className="skeleton-activity" key={item}>

                        <div className="skeleton-activity-dot shimmer"></div>

                        <div className="skeleton-activity-content">

                            <div className="skeleton-line skeleton-activity-title shimmer"></div>

                            <div className="skeleton-line skeleton-activity-description shimmer"></div>

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}


/* =================================
   MAIN APPLICATION
================================= */

function App() {

    const [profile, setProfile] = useState(null);
    const [repos, setRepos] = useState([]);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    async function handleSearch(username) {

        setLoading(true);
        setError('');

        setProfile(null);
        setRepos([]);
        setStats(null);
        setActivities([]);

        try {

            const encodedUsername = encodeURIComponent(username);

            // Fetch the three essential resources

            const [
                profileResponse,
                reposResponse,
                statsResponse
            ] = await Promise.all([

                fetch(`${API_BASE_URL}/api/github/${encodedUsername}`),

                fetch(`${API_BASE_URL}/api/github/${encodedUsername}/repos`),

                fetch(`${API_BASE_URL}/api/github/${encodedUsername}/stats`)

            ]);

            const profileData = await profileResponse.json();
            const reposData = await reposResponse.json();
            const statsData = await statsResponse.json();

            if (!profileResponse.ok) {
                throw new Error(profileData.error || 'Profile not found.');
            }

            if (!reposResponse.ok) {
                throw new Error(reposData.error || 'Unable to fetch repositories.');
            }

            if (!statsResponse.ok) {
                throw new Error(statsData.error || 'Unable to fetch statistics.');
            }

            setProfile(profileData);
            setRepos(reposData);
            setStats(statsData);


            // Fetch activity separately

            try {

                const activityResponse = await fetch(
                    `${API_BASE_URL}/api/github/${encodedUsername}/activity`
                );

                if (activityResponse.ok) {

                    const activityData = await activityResponse.json();

                    setActivities(activityData);

                }

            } catch (activityError) {

                console.error('Activity Fetch Error:', activityError);

            }

        } catch (err) {

            console.error('Search Error:', err);

            setError(err.message);

        } finally {

            setLoading(false);

        }

    }


    return (

        <div className="app">

            <header className="header">

                <h2>fieldnotes<span>.</span></h2>

                <p>GITHUB PROFILE EXPLORER / 001</p>

            </header>


            <main>

                <section className="hero">

                    <p className="eyebrow">
                        A DEVELOPER, DECODED.
                    </p>

                    <h1>
                        Explore the mind
                        <br />
                        behind the code.
                    </h1>

                    <p className="description">
                        Every developer leaves a footprint.
                        Enter a GitHub username to explore theirs.
                    </p>

                    <SearchBar onSearch={handleSearch} />

                </section>


                <section className="results">

                    {/* LOADING SKELETON */}

                    {loading && (

                        <>

                            <div className="loading-label">
                                <span>01 / COLLECTING DATA</span>
                                <p>Mapping the developer's digital footprint...</p>
                            </div>

                            <LoadingSkeleton />

                        </>

                    )}


                    {/* ERROR STATE */}

                    {error && (

                        <div className="empty-state">

                            <span>REQUEST FAILED</span>

                            <p>{error}</p>

                        </div>

                    )}


                    {/* DEVELOPER RESULTS */}

                    {profile && (

                        <>

                            <ProfileCard profile={profile} />

                            {stats && (
                                <StatsDashboard stats={stats} />
                            )}

                            <RepoList repos={repos} />

                            <LanguageFingerprint repos={repos} />

                            <ActivityTimeline activities={activities} />

                        </>

                    )}


                    {/* INITIAL EMPTY STATE */}

                    {!loading && !error && !profile && (

                        <div className="empty-state">

                            <span>01 / WAITING FOR INPUT</span>

                            <p>Your next discovery starts here.</p>

                        </div>

                    )}

                </section>


                {/* SEARCH HISTORY & FAVOURITES */}

                <DeveloperLibrary
                    profile={profile}
                    onSelectProfile={handleSearch}
                />


                {/* DEVELOPER COMPARISON */}

                <DeveloperFaceOff />

            </main>


            <footer className="footer">

                <p>BUILT FOR THE CURIOUS. POWERED BY GITHUB.</p>

                <p>FIELDNOTES © 2026</p>

            </footer>

        </div>

    );

}

export default App;