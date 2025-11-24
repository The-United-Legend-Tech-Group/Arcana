export default () => ({
  // Application Configuration
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration
  database: {
    uri: process.env.MONGO_URI,
  },
});
