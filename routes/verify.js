const express = require('express');
const router = express.Router();
const { verifyCarrierByMC } = require('../services/fmcsaService');

router.get('/', async (req, res) => {
  const { mc_number } = req.query;

  if (!mc_number) {
    return res.status(400).json({ error: 'Missing mc_number query param' });
  }

  try {
    const result = await verifyCarrierByMC(mc_number);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error contacting FMCSA API' });
  }
});

module.exports = router;
