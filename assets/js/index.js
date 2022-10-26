
const apiKey = "086f2712e0cfb8c5b7ff7d7ecfc92e59";
const units = "metric";

const searchInput = $('#searchInput');
const searchButton = $('#searchButton');
const currentWeather = $('#currentWeather');
const cityName = $('#cityName');
const cityCurrentTemp = $('#cityCurrentTemp');
const cityCurrentWind = $('#cityCurrentWind');
const cityCurrentHumidity = $('#cityCurrentHumidity');
const searchHistory = $('#searchHistory');

function apiSearch(input, saveHistory)
{
    var apiUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=1&appid=${apiKey}`;
    searchInput.val("");
    fetch(apiUrl)
    .then((response) => 
    {
        if (!response.ok) return null;
        else return response.json()
    })
    .then((data) => 
    {
        if (data == "") return cityName.text("City not found");
        if (saveHistory) searchHistory.append(`<button class="searchHistoryButton" city="${data[0].name}">${data[0].name}</button>`);
        const date = new Date();
        cityName.text(`${data[0].name}, ${data[0].state} - ${date.toLocaleDateString()}`);
        var lat = data[0].lat;
        var lon = data[0].lon;
        apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
        fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => 
        {
            cityCurrentTemp.text(`Temp: ${data.main.temp}`);
            cityCurrentWind.text(`Wind: ${data.wind.speed}`);
            cityCurrentHumidity.text(`Humidity: ${data.main.humidity}`);
        });
        apiUrl = `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&cnt=5&units=metric`;
        fetch(apiUrl)
        .then((response) => 
        {
            if (!response.ok) return null;
            return response.json();
        })
        .then((data) => 
        {
            if (data == null) return console.log("uh oh");
            for (var i = 1; i <= 5; i++)
            {  
                const date = new Date(data.list[i-1].dt * 1000);
                $(`#day${i}`).text(`${date.toLocaleDateString()}\nTemp: ${data.list[i-1].main.temp}\nWind: ${data.list[i-1].wind.speed}\nHumidity: ${data.list[i-1].main.humidity}`);
            }
        });
    });
}

searchInput.keypress(function (e) {
  if (e.which == 13)
  {
    apiSearch(searchInput.val(), true);
    return false;
  }
});

searchButton.click(function()
{
    apiSearch(searchInput.val(), true);
});

$(document).on('click', '.searchHistoryButton', function()
{
    apiSearch(this.getAttribute("city"), false);
});