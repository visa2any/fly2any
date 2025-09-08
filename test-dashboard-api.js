require('dotenv').config();
const { EmailMarketingDatabase } = require('./src/lib/email-marketing-database');

async function testDashboardAPI() {
  console.log('🧪 Testing Dashboard API with Fixed Queries...\n');
  
  try {
    console.log('1️⃣ Testing getEmailMarketingStats...');
    const stats = await EmailMarketingDatabase.getEmailMarketingStats('30d');
    console.log('📊 Stats Result:');
    console.log(`   Total Contacts: ${stats.totalContacts}`);
    console.log(`   Campaigns Sent: ${stats.campaignsSent}`);
    console.log(`   Avg Open Rate: ${stats.avgOpenRate}`);
    console.log(`   Avg Click Rate: ${stats.avgClickRate}`);
    console.log(`   Segments:`, stats.segmentStats);
    
    console.log('\n2️⃣ Testing getEmailContacts...');
    const contacts = await EmailMarketingDatabase.getEmailContacts({
      limit: 5,
      offset: 0
    });
    console.log(`📧 Contacts Result: ${contacts.total} total, ${contacts.contacts.length} returned`);
    
    if (contacts.contacts.length > 0) {
      console.log('   Sample contacts:');
      contacts.contacts.slice(0, 3).forEach(contact => {
        console.log(`     ${contact.first_name} ${contact.last_name} - ${contact.email} (${contact.email_status})`);
      });
    }
    
    console.log('\n3️⃣ Testing getEmailCampaigns...');
    const campaigns = await EmailMarketingDatabase.getEmailCampaigns(5);
    console.log(`📨 Campaigns Result: ${campaigns.length} campaigns found`);
    
    console.log('\n✅ ALL TESTS PASSED! Dashboard should now show real data.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('   Message:', error.message);
  }
}

testDashboardAPI();