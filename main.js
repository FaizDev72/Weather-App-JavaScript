// Navigation
const userTabEle = document.querySelector("[user-tab]");
const searchTabEle = document.querySelector("[search-tab]");

// Containers
const loadingContEle = document.querySelector(".loading-container");
const grantAccessContEle = document.querySelector(".grant-access-container");
const userContEle = document.querySelector(".user-info-container");
const searchContEle = document.querySelector(".search-container");
const apiErrorMsgContEle = document.querySelector(".api-error-msg-container");

// Essentials
let grantAccessBtnEle = document.querySelector(".grant-access-btn");
let geoLocationMsgEle = document.querySelector(".location-msg");
let searchInputEle = document.querySelector("#search-input");

const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
getFromSessionStorage();

grantAccessBtnEle.addEventListener("click", getLocation);

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    geoLocationMsgEle.innerText =
      "Geolocation is not supported by this browser.";
  }
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      geoLocationMsgEle.innerText = "You denied the request for Geolocation.";
      break;
    case error.POSITION_UNAVAILABLE:
      geoLocationMsgEle.innerText = "Location information is unavailable.";
      break;
    case error.TIMEOUT:
      geoLocationMsgEle.innerText =
        "The request to get user location timed out.";
      break;
    case error.UNKNOWN_ERROR:
      geoLocationMsgEle.innerText = "An unknown error occurred.";
      break;
  }
}
function showPosition(position) {
  let userCoordinates = {
    lat: position.coords.latitude,
    lon: position.coords.longitude,
  };

  localStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
  fetchUserWeatherInfo(userCoordinates);
}

let currentTab = userTabEle;

currentTab.classList.add("current-tab");

userTabEle.addEventListener("click", () => {
  switchTab(userTabEle);
});
searchTabEle.addEventListener("click", () => {
  switchTab(searchTabEle);
});

function switchTab(clickedTab) {
  if (clickedTab !== currentTab) {
    currentTab.classList.remove("current-tab");
    apiErrorMsgContEle.classList.remove('active');
    currentTab = clickedTab;
    currentTab.classList.add("current-tab");

    if (!searchContEle.classList.contains("active")) {
      grantAccessContEle.classList.remove("active");
      userContEle.classList.remove("active");

      searchContEle.classList.add("active");
    } else {
      searchContEle.classList.remove("active");
      userContEle.classList.remove("active");

      getFromSessionStorage();
    }
  }
}

function getFromSessionStorage() {
  let localCoordinates = localStorage.getItem("user-coordinates");

  if (!localCoordinates) {
    grantAccessContEle.classList.add("active");
  } else {
    const coordinates = JSON.parse(localCoordinates);
    fetchUserWeatherInfo(coordinates);
  }
}

async function fetchUserWeatherInfo(coordinates) {
  grantAccessContEle.classList.remove("active");
  loadingContEle.classList.add("active");
  let { lat, lon } = coordinates;

  try {
    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    let data = await response.json();

    loadingContEle.classList.remove("active");
    userContEle.classList.add("active");

    renderUserInfo(data);
  } catch (e) {
    console.log(e);
  }
}

function renderUserInfo(weatherInfo) {
  let cityNameEle = document.querySelector(".city-name");
  let countryFlagEle = document.querySelector(".country-flag");
  let weatherDescEle = document.querySelector(".weather-desc");
  let weatherIconEle = document.querySelector(".weather-icon");
  let tempEle = document.querySelector(".temperature");
  let windspeed = document.querySelector(".windspeed");
  let humidity = document.querySelector(".humidity");
  let cloudiness = document.querySelector(".cloudiness");

  cityNameEle.innerText = weatherInfo?.name;
  countryFlagEle.src = `https://flagcdn.com/16x12/${weatherInfo?.sys?.country.toLowerCase()}.png`;
  weatherDescEle.innerText = weatherInfo?.weather?.[0]?.main;
  weatherIconEle.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
  tempEle.innerText = weatherInfo?.main?.temp + " °C";
  windspeed.innerText = weatherInfo?.wind?.speed;
  humidity.innerText = weatherInfo?.main?.humidity;
  cloudiness.innerText = weatherInfo?.clouds?.all;
}

// Searching Functionality
searchContEle.addEventListener("submit", (e) => {
  e.preventDefault();
  if (searchInputEle.value !== "") {
    fetchWeatherUponCity(searchInputEle.value);
    searchInputEle.value = "";
  }
});

async function fetchWeatherUponCity(city) {
  loadingContEle.classList.add("active");
  userContEle.classList.remove("active");
  apiErrorMsgContEle.classList.remove('active');
  try {
    let response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );

    let data = await response.json();
    if (!data.name) {
      throw data;
    }
    console.log(data);
    loadingContEle.classList.remove("active");
    userContEle.classList.add("active");
    renderUserInfo(data);
  } catch (error) {
    userContEle.classList.remove('active');
    loadingContEle.classList.remove('active');
    apiErrorMsgContEle.classList.add('active');
  }
}
