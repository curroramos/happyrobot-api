const axios = require('axios');
const cache = new Map();

async function verifyCarrierByMC(mcNumber) {
  const apiKey = process.env.FMCSA_API_KEY;
  const url = `https://mobile.fmcsa.dot.gov/qc/services/carriers/docket-number/${mcNumber}?webKey=${apiKey}`;

  if (cache.has(mcNumber)) {
    console.log(`[FMCSA] Cache hit for MC ${mcNumber}`);
    return cache.get(mcNumber);
  }

  console.log(`[FMCSA] Fetching from API for MC ${mcNumber}`);

  try {
    const { data } = await axios.get(url);

    if (!data || !Array.isArray(data.content) || !data.content[0]?.carrier) {
      console.warn(`[FMCSA] No valid data found for MC ${mcNumber}`);
      const error = new Error('Carrier not found or invalid MC number');
      error.status = 404;
      throw error;
    }

    const carrier = data.content[0].carrier;

    const result = {
      mc_number: mcNumber,
      carrier_name: carrier.legalName || 'N/A',
      status: carrier.statusCode === 'A' ? 'ACTIVE' : 'INACTIVE',
      state: carrier.phyState || 'N/A',
      city: carrier.phyCity || 'N/A'
    };

    cache.set(mcNumber, result);

    console.log(`[FMCSA] Parsed and cached result for MC ${mcNumber}`);
    return result;

  } catch (error) {
    console.error(`[FMCSA] Error fetching data for MC ${mcNumber}:`, error.message);
    const err = new Error(error.message || 'Unexpected error during FMCSA API call');
    err.status = error.response?.status || error.status || 500;
    throw err;
  }
}

module.exports = { verifyCarrierByMC };
