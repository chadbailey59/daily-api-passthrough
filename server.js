import express from "express";
import apicache from "apicache-plus";
import fetch from "node-fetch";
import compression from "compression";

const app = express();

app.use(compression());
let cache = apicache.middleware;
app.use(apicache("2 seconds", () => true));

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
