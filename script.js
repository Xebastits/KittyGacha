const apiUrl = 'https://api.thecatapi.com/v1/images/search?limit=1';

const fetchWithTimeout = async (url, options = {}, timeout = 5000) => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchPromise = fetch(url, { ...options, signal });

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => {
            controller.abort();
            reject(new Error('Request timed out'));
        }, timeout)
    );

    return Promise.race([fetchPromise, timeoutPromise]);
};

const handleApiCall = async (url) => {
    try {
        const response = await fetchWithTimeout(url);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('404 Not Found');
            } else if (response.status >= 500) {
                throw new Error('Server Error: ' + response.status);
            } else {
                throw new Error('HTTP Error: ' + response.status);
            }
        }

        const data = await response.json();
        console.log('Data received:', data);
        return data;
    } catch (error) {
        console.error('Fetch error:', error.message);
    }
};

let catImageUrl = '';

async function fetchCatImage() {
    try {
        const data = await handleApiCall(apiUrl);
        if (data && data.length > 0) {
            catImageUrl = data[0].url;
            onButton();
        } else {
            console.error('No data received');
        }
    } catch (error) {
        console.error('Error fetching cat image:', error);
    }
}

function onButton() {
    const catImage = document.getElementById('catImage');
    catImage.src = catImageUrl;
    catImage.style.display = 'block';
    onButtonConfetti();
}

function onButtonConfetti() {
    confetti({
        particleCount: 800,
        spread: 300,
        origin: { y: 0.6 }
    });
}

fetchCatImage();

document.getElementById('catImage').addEventListener('click', onButtonConfetti);