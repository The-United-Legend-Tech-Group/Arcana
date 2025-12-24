export default () => ({
  // Application Configuration
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database Configuration - switches based on NODE_ENV
  database: {
    uri:
      process.env.NODE_ENV === 'test'
        ? 'mongodb://localhost:27017/payroll-test'
        : process.env.MONGO_URI ||
        'mongodb://localhost:27017/payroll-subsystems',
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || process.env.JWT_ACCESS_TOKEN_SECRET || 'default-secret-change-me',
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || process.env.JWT_SECRET || 'default-secret-change-me',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '15m',
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'default-refresh-secret-change-me',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },

  // Gemini AI Configuration
  gemini: {
    apiKey: process.env.GOOGLE_GEMINI_API_KEY || '',
  },
});

