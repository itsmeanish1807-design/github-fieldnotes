const mongoose = require('mongoose');
const Cache = require('../models/Cache');

const CACHE_DURATION = 15 * 60 * 1000;

async function cacheMiddleware(req, res, next) {

    if (req.method !== 'GET') {
        return next();
    }

    // Continue normally if MongoDB is disconnected.
    if (mongoose.connection.readyState !== 1) {
        return next();
    }

    try {
        const cacheKey = req.originalUrl;

        const cachedData = await Cache.findOne({
            key: cacheKey,
            expiresAt: { $gt: new Date() }
        }).lean();

        if (cachedData) {
            console.log('CACHE HIT:', cacheKey);
            res.set('X-Cache', 'HIT');
            return res.json(cachedData.data);
        }

        console.log('CACHE MISS:', cacheKey);
        res.set('X-Cache', 'MISS');

        const originalJson = res.json.bind(res);

        res.json = function (data) {

            if (res.statusCode >= 200 && res.statusCode < 300) {

                Cache.findOneAndUpdate(
                    { key: cacheKey },
                    {
                        $set: {
                            data,
                            expiresAt: new Date(
                                Date.now() + CACHE_DURATION
                            )
                        }
                    },
                    {
                        upsert: true,
                        returnDocument: 'after'
                    }
                ).catch(error => {
                    console.error('Cache Save Error:', error.message);
                });
            }

            return originalJson(data);
        };

        next();

    } catch (error) {
        console.error('Cache Read Error:', error.message);
        next();
    }
}

module.exports = cacheMiddleware;