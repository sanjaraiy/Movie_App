

const API_URL = "https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=04c35731a5ee918f014970082a0088b1&page=1";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";
const SEARCH_API = "https://api.themoviedb.org/3/search/movie?&api_key=";

const YOUTUBE_API_KEY =  ''; // Replace with your YouTube Data API key
const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

const movieBox = document.querySelector("#movie-box");
const searchBar = document.querySelector("#search");

// Create a loading indicator
const loadingIndicator = document.createElement('div');
loadingIndicator.innerText = 'Loading...';
loadingIndicator.style.position = 'fixed';
loadingIndicator.style.top = '50%';
loadingIndicator.style.left = '50%';
loadingIndicator.style.transform = 'translate(-50%, -50%)';
loadingIndicator.style.fontSize = '2rem';
loadingIndicator.style.color = '#fff';
loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
loadingIndicator.style.padding = '1rem 2rem';
loadingIndicator.style.borderRadius = '10px';
loadingIndicator.style.display = 'none';

document.body.appendChild(loadingIndicator);

const showLoading = () => {
    loadingIndicator.style.display = 'block';
};

const hideLoading = () => {
    loadingIndicator.style.display = 'none';
};

const getMovies = async (url) => {
    showLoading();
    const response = await fetch(url);
    const data = await response.json();
    showMovies(data);
    hideLoading();
}

getMovies(API_URL);

const showMovies = (data) => {
    movieBox.innerHTML = "";
    data.results.forEach((result) => {
        const imagePath = result.poster_path === null ? "img/image-missing.png" : IMG_PATH + result.poster_path;
        const box = document.createElement("div");
        box.classList.add("box");
        box.innerHTML = `
            <img src="${imagePath}" alt="" />
            <div class="overlay">
                <div class="title"> 
                    <h2>${result.original_title}</h2>
                    <span>${result.vote_average}</span>
                </div>
                <h3>Overview:</h3>
                <p>${result.overview}</p>
            </div>
        `;
        movieBox.appendChild(box);
    });

    document.querySelectorAll('.box').forEach((boxMovie) => {
        boxMovie.addEventListener('click', async () => {
            const movieTitle = boxMovie.querySelector('.overlay .title h2').innerHTML;

            const videoId = await getYouTubeVideoId(movieTitle);
            if (videoId) {
                const youtubeEmbedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&fullscreen=1`;
                const iframe = document.createElement('iframe');
                iframe.src = youtubeEmbedUrl;
                iframe.style.position = 'fixed';
                iframe.style.top = '0';
                iframe.style.left = '0';
                iframe.style.width = '100%';
                iframe.style.height = '100%';
                iframe.style.border = 'none';
                iframe.allow = 'autoplay; fullscreen';

                // Hide overflow of the body and search bar
                document.body.style.overflow = 'hidden';
                searchBar.style.display = 'none';

                // Create a back button
                const backButton = document.createElement('button');
                backButton.innerText = 'Back to Movies';
                backButton.style.position = 'fixed';
                backButton.style.top = '10px';
                backButton.style.left = '50%';
                backButton.style.transform = 'translateX(-50%)';
                backButton.style.zIndex = '1000';
                backButton.style.padding = '10px 20px';
                backButton.style.backgroundColor = '#ff0000';
                backButton.style.color = '#fff';
                backButton.style.border = 'none';
                backButton.style.borderRadius = '5px';
                backButton.style.cursor = 'pointer';
                backButton.style.fontWeight = '200';

                setTimeout(() => {
                    backButton.style.opacity = '0';
                    backButton.style.transition = 'opacity 0.5s';
                }, 4000);

                backButton.addEventListener('click', () => {
                    iframe.remove();
                    backButton.remove();
                    document.body.style.overflow = 'auto';
                    searchBar.style.display = 'block';
                });

                document.body.appendChild(iframe);
                document.body.appendChild(backButton);

                // Show button on mouse move to the top
                document.addEventListener('mousemove', (event) => {
                    if (event.clientY < 50) { // Show when mouse is at the top 50px
                        backButton.style.opacity = '1';
                    } else {
                        backButton.style.opacity = '0';
                    }
                });

                // Optional: Add a way to exit the full-screen iframe and restore the scroll bar
                iframe.addEventListener('load', () => {
                    window.addEventListener('keydown', (event) => {
                        if (event.key === 'Escape') {
                            iframe.remove();
                            backButton.remove();
                            searchBar.style.display = 'block';
                            document.body.style.overflow = 'auto';
                        }
                    });
                });
            } else {
                alert('No video found for this movie.');
            }
        });
    });
}

const getYouTubeVideoId = async (query) => {
    try {
        const response = await fetch(`${YOUTUBE_SEARCH_URL}?part=snippet&maxResults=1&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`);
        if (!response.ok) {
            throw new Error(`YouTube API request failed with status ${response.status}`);
        }
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].id.videoId;
        } else {
            return null;
        }
    } catch (error) {
        console.error(error.message);
        alert('Failed to fetch video from YouTube. Please check your API key and quota.');
        return null;
    }
}

document.querySelector("#search").addEventListener("keyup", function (event) {
    if (event.target.value != "") {
        getMovies(SEARCH_API + event.target.value)
    } else {
        getMovies(API_URL);
    }
});
