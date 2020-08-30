var apiKey = "13fe265184ae8a7bdc2a5d316e19def2"
var cityHistory = []
var currentCity;

pullCities();

// Create a list of previously searched for cities. Caps at 10 cities
function generateCities(){
    $("#cityHistory").empty();
    $("#cityInput").val("");
    
    for (i=0; i<cityHistory.length; i++){
        var a = $("<a class='list-group-item list-group-item-action city'>");
        a.attr("data-name", cityHistory[i]);
        a.text(cityHistory[i]);
        $("#cityHistory").prepend(a);
    } 
}

// Pulling information from local storage
function pullCities() {
    // Pulling list of cities from local storage
    var storedCities = JSON.parse(localStorage.getItem("cities"));
    if (storedCities !== null) {
    cityHistory = storedCities;
    }
    generateCities();
    // Pulling last searched for city from storage
    var storedCurrent = JSON.parse(localStorage.getItem("currentCity"));
    if (storedCurrent !== null) {
        currentCity = storedCurrent;
    }
        generateWeather();
    }

// Saving cities searched for and current city into local storage
function saveCitiesStorage() {
    localStorage.setItem("cities", JSON.stringify(cityHistory));
    localStorage.setItem("currentCity", JSON.stringify(currentCity));
    }

// When user clicks on the search button, it pulls the data from the input, pushes it into the city history array, and then executes saving to local storage, generating city list, and generating weather
$("#searchBttn").on("click", function(){
    event.preventDefault();
    currentCity = $("#cityInput").val().trim()
    if(currentCity === ""){
        alert("Please enter a city to look up")
    }
    else if(cityHistory.length >= 9){
        cityHistory.shift()
        cityHistory.push(currentCity)
    }
    else{
        cityHistory.push(currentCity)
    }
    $(".card-deck").empty()
    saveCitiesStorage();
    generateCities();
    generateWeather();
})

// If user presses enter instead of clicking search
$("#cityInput").keypress(function(e){
    if(e.which == 13){
        e.preventDefault();
        $("#searchBttn").click();
    }
})

// Generate current weather and five-day forecast
function generateWeather(){
    var queryURLCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${currentCity}&appid=${apiKey}&units=imperial`
    var queryURLForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${currentCity}&appid=${apiKey}&units=imperial`
 

// Getting Current City Information
$.ajax({
    url: queryURLCurrent,
    method: "GET"
}).then(function(response){
    // Saving longitude and lattitude
    var lon = response.coord.lon
    var lat = response.coord.lat
    // API for getting UV index
    var queryURLuv = `https://api.openweathermap.org/data/2.5/uvi?appid=${apiKey}&lat=${lat}&lon=${lon}`
    $.ajax({
        url: queryURLuv,
        method: "GET"
    }).then(function(uvResponse){
        // Creating Date
        var currentDate = moment(response.dt, "X").format(" (MM/DD/YYYY)")
        // Creating Weather Icon
        var iconcode = response.weather[0].icon
        var iconurl = "https://openweathermap.org/img/w/" + iconcode + ".png";
        var weatherImg = $("<img>").attr("src", iconurl)

        // Adding city name, date, and image to card body 
        var currentCityE1 = $("#cityName").text(response.name + currentDate)
        currentCityE1.append(weatherImg)

        // Adding temperature, humidity, and wind speed
        $("#currentTemp").text("Temperature: " + response.main.temp.toFixed(2) + "°F")
        $("#currentHumid").text("Humidity: " + response.main.humidity + "%")
        $("#windCurrent").text("Wind Speed: " + response.wind.speed + "mph")

        // Generating UV index. Adding a class to color the UV index
        var uvNumber = uvResponse.value
        var uvIndex = $("<span>")
        if (uvNumber > 0 && uvNumber <= 2.99){
            uvIndex.addClass("low");
        }else if(uvNumber >= 3 && uvNumber <= 5.99){
            uvIndex.addClass("moderate");
        }else if(uvNumber >= 6 && uvNumber <= 7.99){
            uvIndex.addClass("high");
        }else if(uvNumber >= 8 && uvNumber <= 10.99){
            uvIndex.addClass("vhigh");
        }else{
            uvIndex.addClass("extreme");
        }
        uvIndex.text(uvNumber)

        // Appending UV number to UV index and then appending it to the main body
        var displayUV = $("#uvIndex").text("UV Index: ")
        displayUV.append(uvIndex)
    })
})

// Getting Five Day Forecast
$.ajax({
    url: queryURLForecast,
    method: "GET"
}).then(function(castResponse){
    var forecast = castResponse.list
    // Dynamically generating forecast based on midnight time
    for (let index = 0; index < forecast.length; index++) {
        if (forecast[index].dt_txt.includes("00:00:00")){
            // Card and Card Body
            var card = $("<div class='col-sm-2 card text-white bg-info'>")
            var cardBody = $("<div class='card-body'>")

            // Forecast Date
            var forecastDate = $("<h5 class='card-title'>").text(moment(forecast[index].dt, "X").format(" (MM/DD/YYYY)"))
            
            // Weather Image
            var iconcodeFor = forecast[index].weather[0].icon
            var iconurlFor = "https://openweathermap.org/img/w/" + iconcodeFor + ".png";
            var weatherImgFor = $("<img>").attr("src", iconurlFor)

            // Temperature
            var tempFive = $("<p class='card-text'>").text("Temp: " + forecast[index].main.temp + "°F")

            // Humidity 
            var humidFive = $("<p class='card-text'>").text("Humidity: " + forecast[index].main.humidity + "%");
            
            // Appending everything together
            cardBody.append(forecastDate, weatherImgFor, tempFive, humidFive)
            card.append(cardBody)
            $(".card-deck").append(card)
        }
    }
})
}

function previousSearch(){
    currentCity = $(this).attr("data-name");
    $(".card-deck").empty()
    generateWeather();
}

$(document).on("click", ".city", previousSearch);

