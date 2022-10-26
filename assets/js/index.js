//configurable values
const apiKey = "086f2712e0cfb8c5b7ff7d7ecfc92e59";
const units = "metric";

//load localStorage
var saveData = JSON.parse(localStorage.getItem("mav-weather"));
if (saveData == null) saveData = [];

//getting html elements
const searchInput = $('#searchInput');
const searchButton = $('#searchButton');
const currentWeather = $('#currentWeather');
const cityName = $('#cityName');
const cityCurrentTemp = $('#cityCurrentTemp');
const cityCurrentWind = $('#cityCurrentWind');
const cityCurrentHumidity = $('#cityCurrentHumidity');
const searchHistory = $('#searchHistory');
const clearDataButton = $('#clearData');

//this adds a city button in the search history panel
function addHistoryButton(city)
{
    searchHistory.append(`<button class="searchHistoryButton" city="${city}">${city}</button>`);
}

//the main search function, input parameter is a city name while saveHistory is a boolean to create a new history entry or not
function apiSearch(input, saveHistory)
{
    //create the api url for getting coordinates from a city name
    var apiUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=1&appid=${apiKey}`;
    //clear the search input field
    searchInput.val("");
    //first fetch
    fetch(apiUrl)
    .then((response) => 
    {
        //check if the response is valid
        if (!response.ok) return null;
        else return response.json()
    })
    .then((data) => 
    {
        if (data == "") return cityName.text("City not found");
        //add history entry
        if (saveHistory)
        {
            addHistoryButton(data[0].name);
            saveData.push(data[0].name);
            localStorage.setItem("mav-weather", JSON.stringify(saveData));
        }
        //get the current date
        const date = new Date();
        //output the city name and current date
        cityName.text(`${data[0].name}, ${data[0].state} - ${date.toLocaleDateString()}`);
        //getting coordinates from the json response
        var lat = data[0].lat;
        var lon = data[0].lon;
        //create the api url for getting the current weather from coordinates
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
        //next fetch for current weather
        fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => 
        {
            //output values for current weather
            cityCurrentTemp.text(`Temp: ${data.main.temp}`);
            cityCurrentWind.text(`Wind: ${data.wind.speed}`);
            cityCurrentHumidity.text(`Humidity: ${data.main.humidity}`);
        });
        //create the api url for getting the 5-day forecast from coordinates
        apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&cnt=5&units=metric`;
        //final fetch for 5-day forecast
        fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => 
        {
            //output the date and weather for 5 consecutive days
            for (var i = 1; i <= 5; i++)
            {  
                const date = new Date(data.list[i-1].dt * 1000);
                $(`#day${i}`).text(`${date.toLocaleDateString()}\nTemp: ${data.list[i-1].main.temp}\nWind: ${data.list[i-1].wind.speed}\nHumidity: ${data.list[i-1].main.humidity}`);
            }
        });
    });
}

//listen for click on the search button or just return key in the search field
searchInput.keypress(function (e) {
  if (e.which == 13)
  {
    if (searchInput.val() == "") return false;
    apiSearch(searchInput.val(), true);
    return false;
  }
});
searchButton.click(function()
{
    if (searchInput.val() == "") return false;
    apiSearch(searchInput.val(), true);
    return false;
});

//listen for click on any of the city buttons in the search history panel
$(document).on('click', '.searchHistoryButton', function()
{
    apiSearch(this.getAttribute("city"), false);
});

//listen for clear data button and delete the saveData values and clear localStorage
clearDataButton.click(function()
{
    searchHistory.text("");
    saveData = [];
    localStorage.clear();
});

//if save data exists from localStorage, iterate and add buttons for each city
if (saveData != null)
{
    saveData.forEach(city =>
    {
        addHistoryButton(city);
    });
}