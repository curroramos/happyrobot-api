const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const LOADS_CSV_PATH = path.join(__dirname, '..', 'loads.csv');

function getLoadByReference(reference_number) {
  console.log(`[LoadChecker] Looking for load with reference number: ${reference_number}`);

  return new Promise((resolve, reject) => {
    const results = [];

    fs.createReadStream(LOADS_CSV_PATH)
      .pipe(csv())
      .on('data', (data) => {
        if (data.reference_number === reference_number) {
          results.push(data);
        }
      })
      .on('end', () => {
        if (results.length === 0) {
          console.warn(`[LoadChecker] Load not found: ${reference_number}`);
          const error = new Error('Load not found');
          error.status = 404;
          reject(error);
        } else {
          console.log(`[LoadChecker] Load found: ${JSON.stringify(results[0])}`);
          resolve(results[0]);
        }
      })
      .on('error', (err) => {
        console.error(`[LoadChecker] CSV read error:`, err.message);
        const error = new Error('Failed to read load data');
        error.status = 500;
        reject(error);
      });
  });
}

function searchLoads({ origin, destination, trailer_type }) {
  console.log(`[LoadSearch] Searching with: origin=${origin}, destination=${destination}, trailer_type=${trailer_type}`);

  return new Promise((resolve, reject) => {
    const matches = [];

    fs.createReadStream(LOADS_CSV_PATH)
      .pipe(csv())
      .on('data', (row) => {
        const originMatch = !origin || row.origin.trim().toLowerCase() === origin.trim().toLowerCase();
        const destinationMatch = !destination || row.destination.trim().toLowerCase() === destination.trim().toLowerCase();
        const trailerMatch = !trailer_type || row.equipment_type.toLowerCase().includes(trailer_type.toLowerCase());

        if (originMatch && destinationMatch && trailerMatch) {
          matches.push(row);
        }
      })
      .on('end', () => {
        console.log(`[LoadSearch] Found ${matches.length} match(es)`);
        resolve(matches);
      })
      .on('error', (err) => {
        console.error(`[LoadSearch] CSV read error: ${err.message}`);
        const error = new Error('Failed to read load data');
        error.status = 500;
        reject(error);
      });
  });
}

module.exports = {
  getLoadByReference,
  searchLoads,
};