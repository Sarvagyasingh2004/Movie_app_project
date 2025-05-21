const apiKey = "a45c709f99a7323eb1007254b9044dbe";
const imgApi = "https://image.tmdb.org/t/p/w500";
const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`;
let page = 1;
let isSearching = false;
let filter = "popular";
let isGenreSelected = false;
let genreId = -1;

const inputElement = document.querySelector("#search-input");
const formElement = document.querySelector("#search-form");
const resultElement = document.querySelector("#result");
const menuElement = document.querySelector(".menu");
const filterMenuElement = document.querySelector(".filter-menu");
const genreMenuElement = document.querySelector(".genre-menu");
const filterHeading = document.querySelector(".filter-heading");
const menuIcon = document.querySelector(".menu-icon");
const genreElement = document.querySelector(".genre-select");
const genreButton = document.querySelectorAll;

function createMovieCard(movie) {
  const { poster_path, original_title, release_date, overview, id } = movie;
  const imagePath = poster_path ? imgApi + poster_path : "./img-01.jpeg";
  const truncatedTitle =
    original_title.length > 15
      ? original_title.slice(0, 15) + "..."
      : original_title;
  const formattedDate = release_date || "No release date";
  const cardTemplate = document.createElement("div");
  cardTemplate.setAttribute("class", "column");
  cardTemplate.innerHTML = `
        <div class="card">
          <a class="card-media" href="./img-01.jpeg">
            <img src="${imagePath}" alt="${original_title}" width="100%" />
          </a>
          <div class="card-content">
            <div class="card-header">
              <div class="left-content">
                <h3 style="font-weight: 600">${truncatedTitle}</h3>
                <span style="color: #12efec">${formattedDate}</span>
              </div>
              <div class="right-content">
                <button class="card-btn" onclick="handleClick('${id}')"
                >See About</button
                >
              </div>
            </div>
            <div class="info">${
              overview.length > 250 ? overview.slice(0, 250) + "..." : overview
            }</div>
          </div>
        </div>
      `;
  return cardTemplate;
}

const createMovieInfo = (movie) => {
  const {
    overview,
    release_date,
    original_title,
    genres,
    vote_average,
    runtime,
    poster_path,
  } = movie;
  const imagePath = poster_path ? imgApi + poster_path : "./img-01.jpeg";
  const formattedDate = release_date || "No release date";
  const infoTemplate = document.createElement("div");
  infoTemplate.setAttribute("class", "movie-about-container");
  infoTemplate.innerHTML = `
      <img
            src="${imagePath}"
            alt="${original_title}"
            width="100%"
      />
          <div class="content">
            <h1>${original_title}</h1>
            <h3 class="rating">Rating: ${vote_average.toFixed(1)}⭐️</h3>
            <div class="genres">
              ${genres
                .map((genre) => `<button class="genre">${genre.name}</button>`)
                .join(" ")}
            </div>
            <div class="info">
              <p>Released Date: ${formattedDate}</p>
              <p>Duration: ${runtime} mins</p>
              <p>Overview: ${overview}</p>
              
            </div>
            <button class="back" onclick="handleBack()">⬅ Home</button>
          </div>`;
  return infoTemplate;
};

async function searchMovie(e) {
  resultElement.innerHTML = "";
  e.preventDefault();
  const query = inputElement.value.trim();

  const searchUrl = url + `${query}`;
  const response = await fetch(searchUrl);
  const data = await response.json();
  console.log(data);
  if (data && data.results.length > 0) {
    filterHeading.innerText =
      inputElement.value.charAt(0).toUpperCase() + inputElement.value.slice(1);
    isSearching = true;
    data.results.map((result) => {
      console.log(result);
      const cardElement = createMovieCard(result);
      resultElement.appendChild(cardElement);
    });
  } else {
    filterHeading.innerText = "";
    alert("No such movie found");
    inputElement.value = "";
    init(page);
  }
}

function clearResults() {
  resultElement.innerHTML = "";
  genreId = -1;
  isGenreSelected = false;
}

formElement.addEventListener("submit", (e) => {
  searchMovie(e);
});

async function loadMoreResults() {
  if (isSearching) {
    console.log("returned");
    return;
  }
  page++;
  console.log(isGenreSelected);
  console.log(genreId);
  const response = isGenreSelected
    ? await fetch(
        `https://api.themoviedb.org/3/discover/movie?api_key=a45c709f99a7323eb1007254b9044dbe&page=${page}&with_genres=${genreId}`
      )
    : await fetch(
        `https://api.themoviedb.org/3/movie/${filter}?language=en-US&api_key=${apiKey}&page=${page}`
      );
  const data = await response.json();
  if (data && data.results.length > 0) {
    data.results.forEach((result) => {
      const cardElement = createMovieCard(result);
      resultElement.appendChild(cardElement);
    });
  }
}

function detectEnd() {
  // console.log("detectEnd");
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  if (scrollTop + clientHeight >= scrollHeight - 20) {
    loadMoreResults();
  }
}

window.addEventListener("scroll", detectEnd);

async function handleClick(id) {
  const searchUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=a45c709f99a7323eb1007254b9044dbe`;
  const response = await fetch(searchUrl);
  const data = await response.json();
  if (data) {
    clearResults();
    isSearching = true;
    filterMenuElement.classList.remove("active");
    genreMenuElement.classList.remove("active");
    filterHeading.innerText = "";
    const infoElement = createMovieInfo(data);
    resultElement.appendChild(infoElement);
  }
}

function handleBack() {
  isSearching = false;
  page = 1;
  init(page);
}

async function init(page) {
  filterHeading.innerText = "Popular";
  clearResults();
  const response = await fetch(
    `https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=${apiKey}&page=${page}`
  );
  const data = await response.json();
  if (data && data.results.length > 0) {
    data.results.forEach((result) => {
      const cardElement = createMovieCard(result);
      resultElement.appendChild(cardElement);
    });
  }
}

init(page);

menuIcon.addEventListener("click", () => {
  filterMenuElement.innerHTML = `<button class="filter-btn">Now Playing</button>
        <button class="filter-btn">Popular</button>
        <button class="filter-btn">Top Rated</button>
        <button class="filter-btn">Upcoming</button>`;
  filterMenuElement.classList.toggle("active");
});

menuElement.addEventListener("click", async (e) => {
  if (e.target.classList.contains("filter-btn")) {
    page = 1;
    clearResults();
    // console.log(e.target.innerText);
    if (e.target.innerText.toLowerCase() === "now playing") {
      filterHeading.innerText = e.target.innerText;
      filter = "now_playing";
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/now_playing?language=en-US&api_key=${apiKey}&page=${page}`
      );
      const data = await response.json();
      // console.log(data);
      if (data && data.results.length > 0) {
        data.results.forEach((result) => {
          const cardElement = createMovieCard(result);
          resultElement.appendChild(cardElement);
        });
      }
    } else if (e.target.innerText.toLowerCase() === "popular") {
      filterHeading.innerText = e.target.innerText;
      filter = "popular";
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?language=en-US&api_key=${apiKey}&page=${page}`
      );
      const data = await response.json();
      // console.log(data);
      if (data && data.results.length > 0) {
        data.results.forEach((result) => {
          const cardElement = createMovieCard(result);
          resultElement.appendChild(cardElement);
        });
      }
    } else if (e.target.innerText.toLowerCase() === "top rated") {
      filterHeading.innerText = e.target.innerText;
      filter = "top_rated";
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/top_rated?language=en-US&api_key=${apiKey}&page=${page}`
      );
      const data = await response.json();
      // console.log(data);
      if (data && data.results.length > 0) {
        data.results.forEach((result) => {
          const cardElement = createMovieCard(result);
          resultElement.appendChild(cardElement);
        });
      }
    } else if (e.target.innerText.toLowerCase() === "upcoming") {
      filterHeading.innerText = e.target.innerText;
      filter = "upcoming";
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/upcoming?language=en-US&api_key=${apiKey}&page=${page}`
      );
      const data = await response.json();
      // console.log(data);
      if (data && data.results.length > 0) {
        data.results.forEach((result) => {
          const cardElement = createMovieCard(result);
          resultElement.appendChild(cardElement);
        });
      }
    }
  } else if (e.target.classList.contains("genre-btn")) {
    page = 1;
    clearResults();
    filterHeading.innerText = e.target.innerText;
    isGenreSelected = true;
    genreId = e.target.id;
    const response = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=a45c709f99a7323eb1007254b9044dbe&page=${page}&with_genres=${e.target.id}`
    );
    const data = await response.json();
    // console.log(data);
    if (data && data.results.length > 0) {
      data.results.forEach((result) => {
        const cardElement = createMovieCard(result);
        resultElement.appendChild(cardElement);
      });
    }
  }
});

genreElement.addEventListener("click", async () => {
  const response = await fetch(
    `https://api.themoviedb.org/3/genre/movie/list?language=en&api_key=${apiKey}`
  );
  const data = await response.json();
  genreMenuElement.innerHTML = ``;
  data.genres.map((genre) => {
    genreMenuElement.innerHTML += `<button class="genre-btn" id="${genre.id}">${genre.name}</button>`;
  });
  genreMenuElement.classList.toggle("active");
});
