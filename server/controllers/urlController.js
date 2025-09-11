const validUrl = require('valid-url');
const { nanoid } = require('nanoid');
const Url = require('../model/url');
const dotenv = require('dotenv');
dotenv.config();

// Creating shortened URL
// POST /api/shorten
exports.shortenUrl = async (req, res) => {
    const { originalUrl, customAlias, expiresAt } = req.body;

    if (!originalUrl || !validUrl.isUri(originalUrl)) {
        return res.status(400).json({ error: 'Invalid original URL' });
    }

    try {
        let shortCode = customAlias;

        if (customAlias) {
            const existing = await Url.findOne({ shortCode });
            if (existing) {
                return res.status(400).json({ error: 'Custom alias already in use' });
            }
        }

        const urlCode = new Url({
            originalUrl,
            shortCode: shortCode || nanoid(8), // 8 char unique code
            expiresAt: expiresAt ? new Date(Date.now() + expiresAt * 60000) : null
        });

        await urlCode.save();

        return res.json({
            shortUrl: `${req.protocol}://${req.get('host')}/api/${urlCode.shortCode}`,
            shortCode: urlCode.shortCode
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Redirecting to original URL
// GET /:code
exports.redirect = async (req, res) => {
    const { shortCode } = req.params;
    try {
        const urlDocument = await Url.findOne({ shortCode });

        if (!urlDocument) {
            return res.status(404).json({ error: 'URL not found' });
        }

        if (urlDocument.expiresAt && urlDocument.expiresAt < new Date()) {
            return res.status(410).json({ error: 'URL has expired' });
        }

        urlDocument.clickCount++;
        await urlDocument.save();

        return res.redirect(urlDocument.originalUrl);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Getting URL statistics
// GET /api/statistics/:code
exports.getStatistics = async (req, res) => {
    const { shortCode } = req.params;
    try {
        const urlDocument = await Url.findOne({ shortCode });

        if (!urlDocument) {
            return res.status(404).json({ error: 'URL not found' });
        }

        return res.json({
            originalUrl: urlDocument.originalUrl,
            shortCode: urlDocument.shortCode,
            createdAt: urlDocument.createdAt,
            clickCount: urlDocument.clickCount,
            expiresAt: urlDocument.expiresAt
                ? urlDocument.expiresAt
                : 'Never',
            expired: urlDocument.expiresAt && urlDocument.expiresAt < new Date()
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
