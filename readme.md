# Dexcom NodeJS Web App

This project is an open source Node.js web application to retrieve and display real‑time Dexcom CGM data. I created it due to my personal need to monitor the Dexcom data of a family member using a web app—mainly because Dexcom Follow does not work on my device. This project is primarily based on [pydexcom](https://github.com/gagebenne/pydexcom) but has been converted to Node.js using ChatGPT. It is a non‑commercial project, so feel free to fork, extend, or collaborate!

![Graph](/public/graph.png)

## Features

- **Real‑Time Data**: Fetch current and historical glucose readings from Dexcom.
- **Historical Trends & Tendency**: Derives the latest trend (rising, dropping, etc.) based on the most recent 10‑minute interval within the last 30 minutes.
- **Visual Graph**: Displays a line chart of glucose levels over the last 3 hours using Chart.js, with:
  - Red markers for glucose readings below 70 mg/dL.
  - Purple markers for readings above 180 mg/dL.
- **Simple Authentication**: The UI is password‑protected using HTTP Basic Authentication (configured via an environment variable).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 12 or higher is recommended)
- npm (comes with Node.js)

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://your.repo.url/dexcom-node-web-app.git
   cd dexcom-node-web-app
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Environment Variables**

   Create a file named `.env` in the root directory and update the following variables:

   ```env
   DEXCOM_USERNAME="dexcom-username"
   DEXCOM_PASSWORD="dexcom-pasword"
   DEXCOM_REGION="eu"  # Set as "us", "ous", "jp", etc. accordingly.
   WEB_PASSWORD="local-password" # this is the password you will use to access this web app - you can leave it empty for no password
   ```
   PORT=3000          
   ```

   > **Note:**  
   > Ensure you enter your valid Dexcom credentials, as this application communicates directly with the Dexcom Share API.

## How to Run

1. **Start the Server**

   ```bash
   node index.js
   ```

2. **Access the Web App**

   Open your browser and navigate to [http://localhost:3000](http://localhost:3000).  
   You will be prompted for a password—enter the value specified in `WEB_PASSWORD` from your `.env` file.

## Project Structure

- **index.js**  
  The main entry point that sets up the Express server, handles API endpoints, and protects the UI route using HTTP Basic Authentication.

- **dexcom.js**  
  Contains the Dexcom client code that communicates with Dexcom’s API to fetch current and historical glucose readings, adapted from the [pydexcom](https://github.com/gagebenne/pydexcom) repository.

- **public/**  
  Contains static assets, including:
  - **index.html**: The main UI page built with Bootstrap and Chart.js.
  - Other CSS/JS assets if needed.

- **demo-local.js**
  A demo file that simulates Dexcom data for local testing. This is useful if you want to test the UI without needing to connect to the Dexcom API.
  Configure the .env file and run it using:
  ```bash
  node demo-local.js
  ```

## API Endpoint

- **`GET /api/data`**  
  Returns a JSON object containing:
  - `current`: The latest glucose reading.
  - `tendency`: A text description of the glucose trend (e.g., "Rising", "High", etc.).
  - `visualTendency`: Unicode arrows corresponding to the trend.
  - `history`: An array of historical glucose readings for the last 3 hours.

## UI Overview

- **Current Status**: Displays the current glucose reading in mg/dL and mmol/L.
- **Tendency Indicator**: Shows both a textual and visual (arrow) representation of the trend based on recent data.
- **Glucose Graph**: A responsive Chart.js line graph that plots the last 3 hours of data:
  - Markers colored red if below 70 mg/dL.
  - Markers colored purple if above 180 mg/dL.

## Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to fork this project and submit pull requests.  
This project is maintained on GitHub, and collaboration is encouraged.

## License

This is a non‑commercial project, meant for personal and community use only.  
Please see the [LICENSE](LICENSE) file for more details.

---

Enjoy the Dexcom NodeJS Web App, and happy coding!