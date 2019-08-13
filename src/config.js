module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB_URL: process.env.DATABASE_URL || 'postgresql://todd-nobdy@localhost/graze-app',
  TEST_DB_URL: process.env.TEST_DB_URL || 'postgresql://todd-nobdy@localhost/graze-app-test',
  API_ENDPOINT: `https://graze4096.herokuapp.com/`,
  API_KEY: process.env.REACT_APP_API_KEY,
}
