const app = require('./app');
const PORT = 3005;
app.listen(PORT, () => {
  console.log(`Order service is running on port ${PORT}`);
});