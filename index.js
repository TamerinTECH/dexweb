// server.js
const express = require("express");
const path = require("path");
require("dotenv").config();
const { Dexcom, parseGlucoseReading } = require("./dexcom");

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory.
app.use(express.static(path.join(__dirname, "public")));


// --- Authentication Middleware ---
// This middleware uses HTTP Basic Authentication.
app.use((req, res, next) => {
  if (process.env.WEB_PASSWORD?.length === 0) {
    // No password set, skip authentication.
    return next();
  }
  
  // Get the Authorization header.
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
    return res.status(401).send('Authentication required.');
  }

  // The header should be in the format: "Basic base64encoded(username:password)"
  const token = authHeader.split(' ')[1] || '';
  const credentials = Buffer.from(token, 'base64').toString('ascii'); // "username:password"
  const [, password] = credentials.split(':');

  // Check if the supplied password matches the expected password from process.env
  if (password === process.env.WEB_PASSWORD) {
    return next();
  }
  
  res.setHeader('WWW-Authenticate', 'Basic realm="Secure Area"');
  return res.status(401).send('Invalid credentials.');
});


// Helper: Extract numeric timestamp (ms) from a string like "Date(1691455258000-0400)".
function extractTimestamp(dtString) {
  const match = dtString.match(/Date\((\d+)[^\)]*\)/);
  return match ? parseInt(match[1]) : 0;
}


/**
 * API endpoint for Dexcom data.
 * Retrieves:
 *  - current reading,
 *  - historical data for last 3 hours,
 *  - historical data for last 30 minutes (used to compute tendency)
 */
// server.js (Excerpt from API endpoint)
app.get('/api/data', async (req, res) => {
  try {
    const dexcom = new Dexcom({
      username: process.env.DEXCOM_USERNAME,
      password: process.env.DEXCOM_PASSWORD,
      region: process.env.DEXCOM_REGION || "us",
    }); 
    
    
    // Retrieve historical data for the last 3 hours (180 minutes).
    const historyRaw = await dexcom.getGlucoseReadings(180, 36);
    const history = historyRaw.map(parseGlucoseReading);

    // Sort history in ascending order (oldest first)
    history.sort((a, b) => extractTimestamp(a.raw.DT) - extractTimestamp(b.raw.DT));

    // The current reading is the most recent one.
    const current = history.length > 0 ? history[history.length - 1] : null;

    // Filter readings from the last 30 minutes.
    let last30 = [];
    if (current) {
      const currentTime = extractTimestamp(current.raw.DT);
      const thirtyMinutes = 30 * 60 * 1000; // 30 minutes in ms
      last30 = history.filter(reading => extractTimestamp(reading.raw.DT) >= (currentTime - thirtyMinutes));
    }

    // Determine tendency using the most recent trend:
    // Use a reference reading from approximately 10 minutes before the current reading.
    let tendency = "Not enough data";
    let visualTendency = "";
    if (last30.length >= 2) {
      const currentTime = extractTimestamp(current.raw.DT);
      const referenceTime = currentTime - (10 * 60 * 1000); // 10 minutes ago

      // Find the first reading in last30 that is at or after the reference time.
      let referenceReading = null;
      for (let reading of last30) {
        if (extractTimestamp(reading.raw.DT) >= referenceTime) {
          referenceReading = reading;
          break;
        }
      }
      // If none found, use the earliest reading in last30.
      if (!referenceReading) {
        referenceReading = last30[0];
      }

      // Compute the difference using the current reading and the reference.
      const diff = current.mg_dL - referenceReading.mg_dL;
      if (diff >= 15) {
        tendency = "High ^^";
        visualTendency = "↑↑";
      } else if (diff >= 5) {
        tendency = "High";
        visualTendency = "↑";
      } else if (diff > 0) {
        tendency = "Rising";
        visualTendency = "↗";
      } else if (diff === 0) {
        tendency = "Stable";
        visualTendency = "→";
      } else if (diff > -5) {
        tendency = "Dropping";
        visualTendency = "↘";
      } else if (diff > -15) {
        tendency = "Low";
        visualTendency = "↓";
      } else {
        tendency = "Low two arrows down";
        visualTendency = "↓↓";
      }
    }

    res.json({
      current,
      tendency,
      visualTendency,
      history
    });
  } catch (error) {
    console.error("Error fetching Dexcom data:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Serve the UI page at root.
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
