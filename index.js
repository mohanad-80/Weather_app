import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;
var cityName, latitude, longitude;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  cityName = req.body.city;
  try {
    const result = await axios.get(
      "https://api.api-ninjas.com/v1/geocoding?city=" + cityName,
      {
        headers: {
          "X-Api-Key": "wBS81aIwmsKF8wpLPrPIGA==ewmGcELDu0SYzR2N",
        },
        params: {
          _limit: 1000
        }
      }
    );
    // console.log(result);
    latitude = result.data[0].latitude;
    longitude = result.data[0].longitude;
  } catch (error) {
    console.log("Failed to requst: ", error.message);
    res.status(500).send(error.message);
  }
  try {
    const result = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&current_weather=true&timezone=auto`
    );
    var content = result.data;
    res.render("index.ejs", {
      city: cityName,
      temp: content.current_weather.temperature,
      windspeed: content.current_weather.windspeed,
      isDay: content.current_weather.is_day,

      unit: content.daily_units.temperature_2m_max,

      dates: content.daily.time,
      tempMax: content.daily.temperature_2m_max,
      tempMin: content.daily.temperature_2m_min,

      sunrise: content.daily.sunrise[0],
      sunset: content.daily.sunset[0],
    });
  } catch (error) {
    console.log("Failed to requst: ", error.message);
    res.status(500).render("index.ejs", { error: error.message });
  }
});

app.get("/", async (req, res) => {
  res.render("index.ejs");
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
