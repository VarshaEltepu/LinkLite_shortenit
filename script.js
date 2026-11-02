
const urlInput = document.getElementById("longUrl");
const shortenBtn = document.getElementById("shortenBtn");
const result = document.getElementById("result");

shortenBtn.addEventListener("click", async function () {
    const longUrl = urlInput.value.trim();

    if (longUrl === "") {
        result.textContent = "Please enter a URL!";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/shorten", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ url: longUrl })
        });

        const data = await response.json();

       const shortUrl = `http://localhost:3000/${data.shortCode}`;

result.innerHTML = `
    <p>${data.message}</p>
    <p>Your short link:</p>
    <a href="${shortUrl}" target="_blank">
        ${shortUrl}
    </a>
`;
    } catch (error) {
    result.textContent = error.message;
    console.error("Backend error:", error);
}
});
