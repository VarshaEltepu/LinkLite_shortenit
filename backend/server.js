
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;
const urlDatabase = new Map();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Welcome to LinkLite Backend!");
});

function generateShortCode() {
    return Math.random().toString(36).substring(2, 8);
}


// Shorten URL API
app.post("/api/shorten", (req, res) => {
    const longUrl = req.body.url;

    if (!longUrl) {
        return res.status(400).json({
            message: "Please provide a URL."
        });
    }
    const shortCode = generateShortCode();
    urlDatabase.set(shortCode, longUrl);
    res.json({
        message: "URL received successfully!",
        originalUrl: longUrl,
        shortCode: shortCode
    });
});
app.get("/:shortCode", (req, res) => {
    const shortCode = req.params.shortCode;

    const originalUrl = urlDatabase.get(shortCode);

    if (originalUrl) {
        return res.redirect(originalUrl);
    }

    res.status(404).send("Short URL not found!");
});


// Start the server
app.listen(PORT, () => {
    console.log(`LinkLite server is running on port ${PORT}`);
});
