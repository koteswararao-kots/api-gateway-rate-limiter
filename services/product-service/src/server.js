const app = require('./app');
const PORT = 3004;

app.listen(PORT, () => {
  console.log(`Product service is running on port ${PORT}`);
});