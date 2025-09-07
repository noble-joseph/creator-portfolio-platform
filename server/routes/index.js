import authRoutes from "./routes/authRoutes.js";

const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
  res.send('API is working!');
});

module.exports = router;