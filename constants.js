// constants.js
const REGIONS = {
    US: "us",
    OUS: "ous",
    JP: "jp",
  };
  
  const BASE_URLS = {
    us: "https://share2.dexcom.com/ShareWebServices/Services",
    ous: "https://shareous1.dexcom.com/ShareWebServices/Services",
    eu: "https://shareous1.dexcom.com/ShareWebServices/Services",
    jp: "https://share.dexcom.jp/ShareWebServices/Services",
  };
  
  const APPLICATION_IDS = {
    us: "d89443d2-327c-4a6f-89e5-496bbb0317db",
    ous: "d89443d2-327c-4a6f-89e5-496bbb0317db", // typically same as US
    eu: "d89443d2-327c-4a6f-89e5-496bbb0317db", // typically same as US
    jp: "d8665ade-9673-4e27-9ff6-92db4ce13d13",
  };
  
  const ENDPOINTS = {
    AUTHENTICATE: "General/AuthenticatePublisherAccount",
    LOGIN: "General/LoginPublisherAccountById",
    GLUCOSE: "Publisher/ReadPublisherLatestGlucoseValues",
  };
  
  // You can add additional constants (conversion factor, max limits, etc.)
  const MMOL_L_CONVERSION_FACTOR = 0.0555;
  const MAX_MINUTES = 1440;
  const MAX_MAX_COUNT = 288;
  
  module.exports = {
    REGIONS,
    BASE_URLS,
    APPLICATION_IDS,
    ENDPOINTS,
    MMOL_L_CONVERSION_FACTOR,
    MAX_MINUTES,
    MAX_MAX_COUNT,
  };
  