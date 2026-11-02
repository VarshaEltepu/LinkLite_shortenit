
const urlInput = document.getElementById("longUrl");
const shortenBtn = document.getElementById("shortenBtn");
const shortenForm = document.getElementById("shortenForm");
const statusMessage = document.getElementById("statusMessage");
const result = document.getElementById("result");

// Show a status message to the user
function showMessage(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = "status-message";

    if (type) {
        statusMessage.classList.add(type);
    }
}

// Check whether the entered URL is valid
function isValidUrl(value) {
    try {
        const parsedUrl = new URL(value);

        return (
            (parsedUrl.protocol === "http:" ||
                parsedUrl.protocol === "https:") &&
            parsedUrl.hostname.includes(".")
        );
    } catch {
        return false;
    }
}

// Handle the form submission
shortenForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const longUrl = urlInput.value.trim();

    // Validate the input
    if (!longUrl) {
        showMessage("Please enter a URL.", "error");
        return;
    }

    if (!isValidUrl(longUrl)) {
        showMessage(
            "Please enter a valid URL starting with https:// or http://.",
            "error"
        );
        return;
    }

    // Start the loading state
    shortenBtn.disabled = true;
    shortenBtn.textContent = "Shortening...";
    showMessage("Creating your short link...", "loading");
    result.replaceChildren();

    try {
        const response = await fetch("https://linklite-shortenit.onrender.com/api/shorten", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: longUrl })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Could not shorten this URL.");
        }

        const shortUrl = `https://linklite-shortenit.onrender.com/${data.shortCode}`;

        // Build the result safely using DOM elements
        const resultCard = document.createElement("div");
        resultCard.className = "result-card";

        const successText = document.createElement("p");
        successText.textContent = "Your short link is ready!";

        const link = document.createElement("a");
        link.href = shortUrl;
        link.textContent = shortUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        const copyButton = document.createElement("button");
        copyButton.type = "button";
        copyButton.className = "copy-btn";
        copyButton.textContent = "Copy link";

        copyButton.addEventListener("click", async function () {
            try {
                await navigator.clipboard.writeText(shortUrl);
                copyButton.textContent = "Copied!";
            } catch {
                showMessage(
                    "Copy failed. Please select and copy the link manually.",
                    "error"
                );
            }
        });

        resultCard.append(successText, link, document.createElement("br"));
        resultCard.appendChild(copyButton);
        result.replaceChildren(resultCard);

        showMessage("URL shortened successfully!", "success");

        // Save this link in browser history
        saveToHistory(longUrl, shortUrl);
        renderHistory();

        urlInput.value = "";
    } catch (error) {
        showMessage(
            error.message === "Failed to fetch"
                ? "Could not connect to the backend. Is your server running?"
                : error.message,
            "error"
        );

        console.error(error);
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.textContent = "Shorten URL";
    }
});

// Save links in local browser storage
function saveToHistory(originalUrl, shortUrl) {
    let history = [];

    try {
        history = JSON.parse(localStorage.getItem("linkLiteHistory")) || [];
    } catch {
        history = [];
    }

    history.unshift({
        originalUrl,
        shortUrl,
        createdAt: new Date().toLocaleString()
    });

    history = history.slice(0, 10);

    localStorage.setItem("linkLiteHistory", JSON.stringify(history));
}

// Display saved links
function renderHistory() {
    const historyList = document.getElementById("historyList");
    let history = [];

    try {
        history = JSON.parse(localStorage.getItem("linkLiteHistory")) || [];
    } catch {
        history = [];
    }

    historyList.replaceChildren();

    if (history.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.className = "empty-history";
        emptyMessage.textContent =
            "No links yet. Create your first short link above.";
        historyList.appendChild(emptyMessage);
        return;
    }

    history.forEach((item) => {
        const card = document.createElement("div");
        card.className = "history-item";

        const shortLink = document.createElement("a");
        shortLink.href = item.shortUrl;
        shortLink.textContent = item.shortUrl;
        shortLink.target = "_blank";
        shortLink.rel = "noopener noreferrer";

        const original = document.createElement("p");
        original.textContent = `Original: ${item.originalUrl}`;

        const created = document.createElement("p");
        created.textContent = `Created: ${item.createdAt}`;

        const copyButton = document.createElement("button");
        copyButton.type = "button";
        copyButton.className = "copy-btn";
        copyButton.textContent = "Copy link";

        copyButton.addEventListener("click", async () => {
            try {
                await navigator.clipboard.writeText(item.shortUrl);
                copyButton.textContent = "Copied!";
            } catch {
                showMessage("Copy failed. Please copy the link manually.", "error");
            }
        });

        card.append(shortLink, original, created, copyButton);
        historyList.appendChild(card);
    });
}

// Clear saved history
document.getElementById("clearHistoryBtn").addEventListener("click", () => {
    localStorage.removeItem("linkLiteHistory");
    renderHistory();
    showMessage("Link history cleared.", "success");
});

// Theme toggle
const themeToggle = document.getElementById("themeToggle");

themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");

    themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
    themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );

    localStorage.setItem("linkLiteTheme", isDark ? "dark" : "light");
});

// Restore saved theme
const savedTheme = localStorage.getItem("linkLiteTheme");

if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "Light mode";
    themeToggle.setAttribute("aria-label", "Switch to light mode");
}

// Restore history when the page loads
renderHistory();
