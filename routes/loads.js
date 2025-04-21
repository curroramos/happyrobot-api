const express = require('express');
const router = express.Router();
const { getLoadByReference, searchLoads } = require('../services/loadService');

  router.get('/', async (req, res) => {
    const { reference_number } = req.query;
  
    if (!reference_number) {
      return res.status(400).json({ error: 'Missing reference_number query param' });
    }
  
    try {
      const load = await getLoadByReference(reference_number);
      res.json(load);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    }
  });
  
  router.get('/search', async (req, res) => {
    const { origin, destination, trailer_type } = req.query;
  
    if (!origin && !destination && !trailer_type) {
      return res.status(400).json({
        error: 'At least one of origin, destination, or trailer_type must be provided',
      });
    }
  
    try {
      const results = await searchLoads({ origin, destination, trailer_type });
      res.json(results);
    } catch (err) {
      res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    }
  });

module.exports = router;
