const { writeFileSync } = require('fs');

const required = ['API_URL', 'GOOGLE_CLIENT_ID', 'PAYPAL_CLIENT_ID'];
const missing = required.filter(key => !process.env[key]);
if (missing.length) {
  console.error('Missing required environment variables:', missing.join(', '));
  process.exit(1);
}

const content = `export const environment = {
  production: true,
  apiUrl: "${process.env.API_URL}",
  googleClientId: "${process.env.GOOGLE_CLIENT_ID}",
  paypalClientId: "${process.env.PAYPAL_CLIENT_ID}",
};
`;

writeFileSync('./src/environments/environment.ts', content);
console.log('Environment file generated.');
