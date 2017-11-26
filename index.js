'use strict';

const micro = require('micro');
const axios = require('axios');
const qs = require('querystring');
const url = require('url');

const CITYLIST = require('./city.list.json');
const ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';
const API_KEY = process.env.API_KEY;

module.exports = async (req, res) => {
  let queryParams = qs.parse(url.parse(req.url).query);
  let cityId = null;

  if (!queryParams.country) {
    return micro.send(res, 400, 'Country code is required!');
  }

  if (queryParams.country && queryParams.city) {
    cityId = CITYLIST.find(city => (city.name === queryParams.city || city.name.includes(queryParams.city)) && city.country === queryParams.country).id;
  } else { // find closest match if only country is provided
    cityId = CITYLIST.find(city => city.country === queryParams.country).id;
  }

  try {
    let results = await axios.get(`${ENDPOINT}?id=${cityId}&appid=${API_KEY}&units=metric`);
    res.end(JSON.stringify(Object.assign(results.data.main, { condition: results.data.weather[0].main })));
  } catch(e) {
    micro.send(res, 400, e.message || e);
  }
};
