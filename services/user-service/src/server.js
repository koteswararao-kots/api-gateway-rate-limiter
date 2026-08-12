const app = require('./app');
const PORT =  3001;
app.listen(PORT, () => {
  console.log(`User-Service is running on port ${PORT}`);
});