'use strict';

const micro = require('micro');
const axios = require('axios');
const qs = require('querystring');
const url = require('url');

const ENDPOINT = 'https://api.openweathermap.org/data/2.5/weather';
const API_KEY = process.env.API_KEY;

module.exports = async (req, res) => {
  let queryParams = qs.parse(url.parse(req.url).query);

  if (!queryParams.country || !queryParams.city) {
    return micro.send(res, 400, 'Country and/or City is missing!');
  }

  try {
    let results = await axios.get(`${ENDPOINT}?q=${queryParams.city},${queryParams.country}&appid=${API_KEY}&units=metric`);
    res.end(JSON.stringify(Object.assign(results.data.main, { condition: results.data.weather[0].main })));
  } catch(e) {
    micro.send(res, 400, e.message || e);
  }
};
