require('dotenv').config();
const { Dexcom, parseGlucoseReading } = require('./dexcom');

// You can set your credentials in a .env file:
//   DEXCOM_USERNAME=your_username
//   DEXCOM_PASSWORD=your_password
// Alternatively, replace process.env with hard-coded strings (not recommended for production)
const username = process.env.DEXCOM_USERNAME;
const password = process.env.DEXCOM_PASSWORD;
const region = process.env.DEXCOM_REGION || "us";

// You can also use accountId instead of username if desired:
// const accountId = process.env.DEXCOM_ACCOUNT_ID;

async function run() {
  try {
    const dexcom = new Dexcom({ username, password, region });
    const rawReading = await dexcom.getCurrentGlucoseReading();
    if (!rawReading) {
      console.log("No glucose reading available.");
      return;
    }
    const reading = parseGlucoseReading(rawReading);
    console.log("Current Glucose Reading:");
    console.log(`mg/dL: ${reading.mg_dL}`);
    console.log(`mmol/L: ${reading.mmol_L}`);

    
    // Retrieve historical glucose data for the last 3 hours (180 minutes)
    // Here we assume one reading every 5 minutes so we set maxCount to 36.
    const historicalRawReadings = await dexcom.getGlucoseReadings(180, 36);
    
    if (!historicalRawReadings || historicalRawReadings.length === 0) {
      console.log("No historical data available.");
      return;
    }

    // Parse each reading into a more friendly format:
    const historicalReadings = historicalRawReadings.map((raw) => parseGlucoseReading(raw));
    
    // Optionally sort readings by time if they aren't already in chronological order:
    historicalReadings.sort((a, b) => {
      // Assuming the raw JSON contains a key DT like "Date(1691455258000-0400)"
      // and parseGlucoseReading returns a JavaScript Date object in "a.datetime"
      // You might want to extract or compute a proper date based on your implementation.
      return new Date(a.raw.DT.replace(/Date\((\d+)[^)]*\)/, '$1') * 1) -
             new Date(b.raw.DT.replace(/Date\((\d+)[^)]*\)/, '$1') * 1);
    });
    
    console.log("Historical Glucose Readings for the last 3 hours:");
    historicalReadings.forEach((reading, index) => {
      console.log(`${index + 1}: ${reading.mg_dL} mg/dL (${reading.mmol_L} mmol/L)`);
    });

    // Now you can pass these readings to your graphing library or service.
    // For example, you could set up an HTTP endpoint that returns this data to
    // a frontend charting library like Chart.js or D3.js.
  } catch (error) {
    console.error("Error retrieving Dexcom data:", error.message);
  }
}

run();
