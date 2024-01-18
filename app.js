const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const app = express();
const translate = require('translate-google');
const port = process.env.PORT || 3000;

app.use(express.static('public'));

async function translateToAzerbaijani(text) {
  try {
    const translatedText = await translate(text, { to: 'az' }); // 'az' is the language code for Azerbaijani
    console.log(`Original Text: ${text}`);
    console.log(`Translated Text: ${translatedText}`);
    return translatedText;
  } catch (error) {
    console.error('Error:', error.message);
    throw new Error('Translation failed.');
  }
}

async function scrapeWeather() {
  const url = 'https://havadurumu15gunluk.xyz/havadurumu/1513/azerbaycan-balaken-hava-durumu-15-gunluk.html';

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const weatherStatus = $('.status').text();
    const temperature = $('.temperature.type-1').text();

    console.log('Hava Durumu:', weatherStatus);
    console.log('Sıcaklık:', temperature);

    return { weatherStatus, temperature };
  } catch (error) {
    console.error('Hata:', error.message);
    throw new Error('Error.');
  }
}

app.get('/', async (req, res) => {
  try {
    const weatherData = await scrapeWeather();
    const translatedWeatherStatus = await translateToAzerbaijani(weatherData.weatherStatus);

    res.send(`
      <html>
    <head>
      <link rel="stylesheet" type="text/css" href="/styles.css">
      <link rel="stylesheet" href="public/styles.css">
    </head>
    <body>
    <h1 style="color: black;">Balakən üçün hava proqnozu</h1>
      <h1 class="weather-status">Hava Proqnozu: ${translatedWeatherStatus}</h1>
      <h1 class="temperature">Istilik: ${weatherData.temperature}</h1>
      <hr>
      <h2>REKLAM QISMI</h2>
      <h2>Instagram: @hudul0v</h2>
    </body>
  </html>
    `);
  } catch (error) {
    console.error('Hata:', error.message);
    res.status(500).send('Error .');
  }
});


app.listen(port, () => {
  console.log(`Uygulama http://localhost:${port} adresinde çalışıyor.`);
});
