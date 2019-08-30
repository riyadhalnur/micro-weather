'use strict';

const micro = require('micro');
const axios = require('axios');
const qs = require('querystring');
const url = require('url');

const WEATHER_ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';
const AIR_QUALITY_ENDPOINT = "http://api.waqi.info/feed/";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const AIR_QUALITY_API_KEY = process.env.AIR_QUALITY_API_KEY;

module.exports = async (req, res) => {
  let queryParams = qs.parse(url.parse(req.url).query);

  if (!queryParams.country || !queryParams.city) {
    return micro.send(res, 400, 'Country and/or City is missing!');
  }

  try {
    let weatherResults = await axios.get(`${WEATHER_ENDPOINT}?q=${queryParams.city},${queryParams.country}&appid=${WEATHER_API_KEY}&units=metric`);
    let airQualityResults = await axios.get(`${AIR_QUALITY_ENDPOINT}/${queryParams.city}/?token=${AIR_QUALITY_API_KEY}`);

    let response = Object.assign(weatherResults.data.main, { condition: weatherResults.data.weather[0].main});
    if (airQualityResults.data.data) {
      response = Object.assign(response, { aqi: airQualityResults.data.data.aqi, iaqi: airQualityResults.data.data.iaqi });
    }
    res.end(JSON.stringify(response));
  } catch(e) {
    micro.send(res, 400, e.message || e);
  }
};
