const dns = require('dns');

if (process.env.NODE_ENV !== 'production') {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
}

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const cacheMiddleware = require('./middleware/cacheMiddleware');
const app = express();
const libraryRoutes = require('./routes/libraryRoutes');


// =================================
// CORS CONFIGURATION
// =================================

const allowedOrigins = (
    process.env.CLIENT_URL || 'http://localhost:5173'
)
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({

    origin: function (origin, callback) {

        // Allow requests without an Origin header (e.g. server health checks)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));

    },

    methods: ['GET', 'POST', 'PUT', 'DELETE'],

    allowedHeaders: ['Content-Type', 'Authorization']

}));

app.use(express.json());
app.use('/api/library', libraryRoutes);
app.use('/api/github', cacheMiddleware);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.json({
        message: 'GitHub Fieldnotes API is running!'
    });
});

// GitHub profile endpoint
app.get('/api/github/:username', async (req, res) => {

    try {

        const { username } = req.params;

        const response = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github+json'
                }
            }
        );

        if (response.status === 404) {
            return res.status(404).json({
                error: 'GitHub user not found.'
            });
        }

        if (response.status === 403) {
            return res.status(429).json({
                error: 'GitHub API rate limit reached.'
            });
        }

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Unable to fetch GitHub profile.'
            });
        }

        const profile = await response.json();

        res.json(profile);

    } catch (error) {

        console.error('GitHub API Error:', error);

        res.status(500).json({
            error: 'Internal server error.'
        });

    }

});

// Fetch public repositories
app.get('/api/github/:username/repos', async (req, res) => {

    try {

        const { username } = req.params;

        const response = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github+json'
                }
            }
        );

        if (response.status === 404) {
            return res.status(404).json({
                error: 'GitHub user not found.'
            });
        }

        if (response.status === 403 || response.status === 429) {
            return res.status(429).json({
                error: 'GitHub API rate limit reached.'
            });
        }

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Unable to fetch repositories.'
            });
        }

        const repos = await response.json();

        const topRepos = repos
    .filter(repo => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5);

// Fetch language data for each repository
const enrichedRepos = await Promise.all(
    topRepos.map(async (repo) => {
        const languageResponse = await fetch(
            `https://api.github.com/repos/${repo.full_name}/languages`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github+json'
                }
            }
        );

        const languages = languageResponse.ok
            ? await languageResponse.json()
            : {};

        return {
            ...repo,
            languages
        };
    })
);

res.json(enrichedRepos);
    } catch (error) {

        console.error('Repository API Error:', error);

        res.status(500).json({
            error: 'Unable to retrieve repositories.'
        });

    }

});

// Developer Statistics Endpoint
app.get('/api/github/:username/stats', async (req, res) => {
    try {
        const { username } = req.params;

        const headers = {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github+json'
        };

        // Fetch profile information
        const profileResponse = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`,
            { headers }
        );

        if (profileResponse.status === 404) {
            return res.status(404).json({
                error: 'GitHub user not found.'
            });
        }

        if (profileResponse.status === 403 ||
            profileResponse.status === 429) {
            return res.status(429).json({
                error: 'GitHub API rate limit reached.'
            });
        }

        if (!profileResponse.ok) {
            return res.status(profileResponse.status).json({
                error: 'Unable to fetch developer statistics.'
            });
        }

        const profile = await profileResponse.json();

        // Fetch all public repositories in batches of 100
        const totalPages = Math.ceil(profile.public_repos / 100);

        const repoRequests = [];

        for (let page = 1; page <= totalPages; page++) {
            repoRequests.push(
                fetch(
                    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&page=${page}`,
                    { headers }
                )
            );
        }

        const repoResponses = await Promise.all(repoRequests);

        const allRepos = [];

        for (const response of repoResponses) {
            if (response.status === 403 || response.status === 429) {
                return res.status(429).json({
                    error: 'GitHub API rate limit reached.'
                });
            }

            if (!response.ok) {
                return res.status(response.status).json({
                    error: 'Unable to fetch repository statistics.'
                });
            }

            const data = await response.json();
            allRepos.push(...data);
        }

        // Calculate statistics
        const totalStars = allRepos.reduce(
            (total, repo) => total + repo.stargazers_count,
            0
        );

        const totalForks = allRepos.reduce(
            (total, repo) => total + repo.forks_count,
            0
        );

        res.json({
            publicRepos: profile.public_repos,
            totalStars,
            totalForks,
            followers: profile.followers,
            following: profile.following,
            createdAt: profile.created_at
        });

    } catch (error) {
        console.error('Statistics API Error:', error);

        res.status(500).json({
            error: 'Unable to retrieve developer statistics.'
        });
    }
});

// GitHub Activity Timeline Endpoint

app.get('/api/github/:username/activity', async (req, res) => {
    try {
        const { username } = req.params;

        const response = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: 'application/vnd.github+json'
                }
            }
        );

        if (response.status === 404) {
            return res.status(404).json({
                error: 'GitHub user not found.'
            });
        }

        if (response.status === 403 || response.status === 429) {
            return res.status(429).json({
                error: 'GitHub API rate limit reached.'
            });
        }

        if (!response.ok) {
            return res.status(response.status).json({
                error: 'Unable to fetch GitHub activity.'
            });
        }

        const events = await response.json();

        const activities = events.map((event) => {

            const payload = event.payload || {};

            let action = 'Performed an activity';
            let category = 'OTHER';

            switch (event.type) {

                case 'PushEvent':
                    category = 'COMMIT';
                    action = `Pushed ${payload.commits?.length || 0} commit(s) to ${payload.ref?.replace('refs/heads/', '') || 'a branch'}`;
                    break;

                case 'PullRequestEvent':
                    category = 'PULL REQUEST';
                    action = `${payload.action || 'Updated'} pull request #${payload.number || ''}: ${payload.pull_request?.title || ''}`;
                    break;

                case 'IssuesEvent':
                    category = 'ISSUE';
                    action = `${payload.action || 'Updated'} issue #${payload.issue?.number || ''}: ${payload.issue?.title || ''}`;
                    break;

                case 'CreateEvent':
                    category = 'CREATED';
                    action = `Created ${payload.ref_type || 'a resource'}: ${payload.ref || event.repo.name}`;
                    break;

                case 'WatchEvent':
                    category = 'STAR';
                    action = 'Starred a repository';
                    break;

                case 'ForkEvent':
                    category = 'FORK';
                    action = 'Forked a repository';
                    break;

                case 'ReleaseEvent':
                    category = 'RELEASE';
                    action = `Published release: ${payload.release?.tag_name || 'New release'}`;
                    break;

                case 'DeleteEvent':
                    category = 'DELETED';
                    action = `Deleted ${payload.ref_type || 'a resource'}: ${payload.ref || ''}`;
                    break;

                default:
                    action = event.type.replace('Event', '');
            }

            return {
                id: event.id,
                type: event.type,
                category,
                action,
                repository: event.repo.name,
                repositoryUrl: `https://github.com/${event.repo.name}`,
                createdAt: event.created_at
            };

        });

        res.json(activities);

    } catch (error) {

        console.error('Activity API Error:', error);

        res.status(500).json({
            error: 'Unable to retrieve GitHub activity.'
        });

    }
});

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected successfully!');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.log('Server will continue without caching.');
    }

    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

startServer();