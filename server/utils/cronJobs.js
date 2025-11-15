const cron = require('node-cron');
const { checkAllWebsites } = require('../services/monitoringService');

// Cron jobs setup karna
const setupCronJobs = () => {
  console.log('🕐 Setting up cron jobs...');
  
  // Har 5 minute mein websites check karo
  cron.schedule('*/5 * * * *', async () => {
    console.log('⏰ Running scheduled website check...');
    await checkAllWebsites();
  });
  
  // Har 1 minute mein (testing ke liye) - comment out kar dena production mein
  cron.schedule('* * * * *', async () => {
    console.log('🧪 Test check running...');
    // await checkAllWebsites(); // Testing ke liye enable karo
  });

  console.log('✅ Cron jobs setup completed');
};

module.exports = { setupCronJobs };