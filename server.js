import * as dotenv from "dotenv";
dotenv.config();
console.log(process.env);
import express from "express";
import apicache from "apicache-plus";
import fetch from "node-fetch";
import compression from "compression";

const app = express();

app.use(compression());
let cache = apicache.middleware;
app.use(apicache("5 seconds", () => true));
let rooms;

setInterval(async () => {
  let resp = await fetch("https://api.daily.co/v1/presence", {
    headers: {
      authorization: `Bearer ${process.env.DAILY_API_TOKEN}`,
    },
  });
  rooms = await resp.json();
  console.log(
    `${new Date().toISOString()} Updated rooms data (${
      Object.keys(rooms).length
    } rooms)`
  );
  console.log("rooms: ", rooms);
}, 2000);

app.get("/meetings", async (req, res) => {
  let roomName = req.query.room;
  res.send(rooms[roomName]);
});

app.get("*", async (req, res) => {
  const dailyApiPath = `https://api.daily.co/v1${req.originalUrl}`;
  console.log(
    `${new Date().toISOString()} Making Daily API request to: ${dailyApiPath}`
  );
  let resp = await fetch(dailyApiPath, {
    headers: { authorization: req.headers.authorization },
  });
  // Don't even bother parsing the JSON; just send it back as-is
  let t = await resp.text();
  res.set("content-type", "text/javascript");
  res.send(t);
});

app.listen(process.env.PORT || 3069, () => {
  console.log(`Example app listening on port ${process.env.PORT || 3069}`);
});
