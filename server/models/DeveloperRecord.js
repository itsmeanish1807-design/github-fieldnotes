const mongoose = require('mongoose');

const developerRecordSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    profile: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },

    searchedAt: {
        type: Date,
        default: null
    },

    isFavorite: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    'DeveloperRecord',
    developerRecordSchema
);