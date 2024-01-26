import React, { useState } from "react";
import { Container, TextField, Button, Card, Typography, Grid, Slider } from '@mui/material';
import './weatherstyles.css';

const API_KEY = "4f2d66d07bb53f1a93c818d6228a8d40";

function Weather() {
    const [query, setQuery] = useState("");
    const [forecast, setForecast] = useState([]);
    const [currentCity, setCurrentCity] = useState("");
    const [currentWeather, setCurrentWeather] = useState(null);
    const [unit, setUnit] = useState('metric');
    const [error, setError] = useState("");
    const toggleUnit = (newUnit) => {
    setUnit(newUnit);
};
    const search = async (e) => {
        if (e.key === "Enter") {
            setCurrentCity(query);
            setError("");

            try {
                const geoResponse = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=1&appid=${API_KEY}`);
                if (!geoResponse.ok) {
                    throw new Error("Failed to fetch city information. Please try a different city.");
                }
                const geoData = await geoResponse.json();
                if (geoData && geoData.length > 0) {
                    const { lat, lon } = geoData[0];
                    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                    const forecastData = await forecastResponse.json();
                    setForecast(forecastData.list);

                    const currentWeatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
                    const currentWeatherData = await currentWeatherResponse.json();
                    setCurrentWeather(currentWeatherData);
                    setQuery("");
                } else {
                    setError("City not found. Please try a different city.");
                }
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const convertToCelsiusToFahrenheit = (tempCelsius) => {
        return tempCelsius * 9/5 + 32;
    };

    const groupedForecasts = forecast.reduce((groups, data) => {
        const date = new Date(data.dt_txt).toDateString();
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(data);
        return groups;
    }, {});

    return (
        <Container className="weather-container">
            <Grid container className="grid-item">
                <Grid item xs={12}>
                <TextField 
        fullWidth
            variant="outlined"
            label="Search for a city and press Enter"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
             onKeyPress={search}
             className="search-bar"
            />
                </Grid>
                <Grid item xs={12}>
    <Button 
        variant={unit === 'metric' ? "contained" : "outlined"}
        color="primary" 
        onClick={() => toggleUnit('metric')} 
        className="temperature-button"
    >
        Celsius
    </Button>
    <Button 
        variant={unit === 'imperial' ? "contained" : "outlined"}
        color="secondary" 
        onClick={() => toggleUnit('imperial')} 
        className="temperature-button"
    >
        Fahrenheit
    </Button>
</Grid>
                <Grid item xs={12}>
                    {error && <Typography className="error-text">{error}</Typography>}
                </Grid>
                {currentWeather && (
                    <Grid item xs={12} >
                        <Card className="currentw">
                            <Typography variant="h5" className="currentw">Current Conditions: {currentWeather.name}</Typography>
                            <Typography className="currentw">Temperature: {unit === 'metric' ? Math.round(currentWeather.main.temp) : Math.round(convertToCelsiusToFahrenheit(currentWeather.main.temp))}°{unit === 'metric' ? 'C' : 'F'}</Typography>
                            <Typography className="currentw">Humidity: {currentWeather.main.humidity}%</Typography>
                            <Typography className="currentw">Wind Speed: {currentWeather.wind.speed} m/s</Typography>
                            <Typography className="currentw">Weather: {currentWeather.weather[0].description}</Typography>
                        </Card>
                    </Grid>
                )}
            </Grid>

            <Grid container className="forecast-slider" spacing={2}>
                {Object.keys(groupedForecasts).map(date => (
                    <Grid item key={date} xs={2}>
                        <Card  className="dayotw">
                            <Typography variant="h5"  className="dayotw">{date}</Typography>
                            {groupedForecasts[date].map((data, index) => (
                                <div key={index}  className="dayotw">
                                    <Typography >
                                        {data.dt_txt.split(' ')[1]} - 
                                        {unit === 'metric' 
                                            ? Math.round(data.main.temp) 
                                            : Math.round(convertToCelsiusToFahrenheit(data.main.temp))}
                                        °{unit === 'metric' ? 'C' : 'F'}, {data.weather[0].description}
                                    </Typography>
                                    <img 
                                        src={`http://openweathermap.org/img/wn/${data.weather[0].icon}.png`}
                                        alt={data.weather[0].description}
                                    />
                                </div>
                            ))}
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
}

export default Weather;
