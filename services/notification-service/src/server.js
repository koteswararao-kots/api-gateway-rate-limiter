const app = require('./app');
const PORT = 3006;

app.listen(PORT, () => {
  console.log(`Notification service is running on port ${PORT}`);
});
