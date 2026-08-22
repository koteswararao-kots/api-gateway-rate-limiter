require('dotenv').config();
const {API_KEY} = process.env;

const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Invalid API key.' });
  }
  next();
}

module.exports = { authenticateApiKey };