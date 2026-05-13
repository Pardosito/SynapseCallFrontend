const { writeFileSync } = require('fs');

const content = `export const environment = {
  production: true,
  apiUrl: "${process.env.API_URL}",
  googleClientId: "${process.env.GOOGLE_CLIENT_ID}",
  paypalClientId: "${process.env.PAYPAL_CLIENT_ID}",
};
`;

writeFileSync('./src/environments/environment.ts', content);
console.log('Environment file generated.');
