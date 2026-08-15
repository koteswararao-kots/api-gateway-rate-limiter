const app = require('./app');
const PORT = 3003;
app.listen(PORT, () => {
  console.log(`Order service is running on port ${PORT}`);
});