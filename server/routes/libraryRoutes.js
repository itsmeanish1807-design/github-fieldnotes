const express = require('express');
const router = express.Router();

const DeveloperRecord = require('../models/DeveloperRecord');

// GET SEARCH HISTORY
router.get('/history', async (req, res) => {
    try {
        const history = await DeveloperRecord.find({
            searchedAt: { $ne: null }
        })
            .sort({ searchedAt: -1 })
            .limit(20)
            .lean();

        res.json(history);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch search history'
        });
    }
});


// SAVE SEARCH HISTORY
router.post('/history', async (req, res) => {
    try {
        const { profile } = req.body;

        if (!profile || !profile.login) {
            return res.status(400).json({
                message: 'Valid GitHub profile required'
            });
        }

        const username = profile.login.toLowerCase();

        const record = await DeveloperRecord.findOneAndUpdate(
            { username },
            {
                $set: {
                    profile,
                    searchedAt: new Date()
                }
            },
            {
                upsert: true,
                returnDocument: 'after',
                runValidators: true
            }
        );

        res.json(record);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to save search history'
        });
    }
});


// DELETE ONE HISTORY ENTRY
router.delete('/history/:username', async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();

        await DeveloperRecord.findOneAndUpdate(
            { username },
            { $set: { searchedAt: null } }
        );

        res.json({
            message: 'History entry removed'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to remove history entry'
        });
    }
});


// CLEAR ALL SEARCH HISTORY
router.delete('/history', async (req, res) => {
    try {
        await DeveloperRecord.updateMany(
            {},
            { $set: { searchedAt: null } }
        );

        res.json({
            message: 'Search history cleared'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to clear search history'
        });
    }
});


// GET FAVOURITES
router.get('/favorites', async (req, res) => {
    try {
        const favorites = await DeveloperRecord.find({
            isFavorite: true
        })
            .sort({ updatedAt: -1 })
            .lean();

        res.json(favorites);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to fetch favourites'
        });
    }
});


// ADD FAVOURITE
router.post('/favorites', async (req, res) => {
    try {
        const { profile } = req.body;

        if (!profile || !profile.login) {
            return res.status(400).json({
                message: 'Valid GitHub profile required'
            });
        }

        const username = profile.login.toLowerCase();

        const record = await DeveloperRecord.findOneAndUpdate(
            { username },
            {
                $set: {
                    profile,
                    isFavorite: true
                },
                $setOnInsert: {
                    searchedAt: null
                }
            },
            {
                upsert: true,
                returnDocument: 'after',
                runValidators: true
            }
        );

        res.json(record);

    } catch (error) {
        res.status(500).json({
            message: 'Failed to add favourite'
        });
    }
});


// REMOVE FAVOURITE
router.delete('/favorites/:username', async (req, res) => {
    try {
        const username = req.params.username.toLowerCase();

        await DeveloperRecord.findOneAndUpdate(
            { username },
            { $set: { isFavorite: false } }
        );

        res.json({
            message: 'Favourite removed'
        });

    } catch (error) {
        res.status(500).json({
            message: 'Failed to remove favourite'
        });
    }
});

module.exports = router;