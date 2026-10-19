import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:3000/api/v1';

async function verify() {
  console.log('--- Verifying Vendor and Agent APIs ---');
  try {
    // 1. We need a token. We can login or create a test user.
    // For simplicity, let's login with email if auth route exists, or we can just send OTP.
    console.log('Sending OTP to 9999999999...');
    const otpRes = await axios.post(`${API_URL}/auth/send-otp`, { phone: '9999999999' });
    console.log('OTP sent:', otpRes.data);

    const devOtp = otpRes.data.devOtp || '123456';
    console.log(`Verifying OTP (${devOtp})...`);
    const verifyRes = await axios.post(`${API_URL}/auth/verify-otp`, { 
      phone: '9999999999', 
      otp: devOtp, 
      name: 'Test Vendor/Agent' 
    });
    
    const token = verifyRes.data.tokens.accessToken;
    console.log('Logged in! Token:', token.substring(0, 20) + '...');

    const headers = { Authorization: `Bearer ${token}` };

    // Create a shop to become a vendor
    console.log('\n--- Creating a Shop ---');
    try {
      const shopRes = await axios.post(`${API_URL}/shops`, {
        name: 'Test Verify Shop',
        addressLine: '123 Test St',
        category: 'DRY_CLEANING',
        cityName: 'Test City',
        state: 'TS',
        pincode: '123456'
      }, { headers });
      console.log('Shop created/claimed successfully.');
    } catch (err: any) {
      if (err.response?.status === 409) {
        console.log('Shop already exists, skipping creation.');
      } else {
        throw err;
      }
    }

    // VENDOR APIs
    console.log('\n--- Testing Vendor APIs ---');
    const shopFetch = await axios.get(`${API_URL}/vendors/shop`, { headers });
    console.log('Vendor Shop:', shopFetch.data.data.name);

    const vendorOrders = await axios.get(`${API_URL}/vendors/orders`, { headers });
    console.log('Vendor Orders Count:', vendorOrders.data.data.total);

    // AGENT APIs
    console.log('\n--- Testing Agent APIs ---');
    const agentProfile = await axios.get(`${API_URL}/agents/profile`, { headers });
    console.log('Agent Profile Created/Fetched:', agentProfile.data.data.id);

    const agentStatus = await axios.patch(`${API_URL}/agents/status`, { isOnline: true }, { headers });
    console.log('Agent isOnline updated to:', agentStatus.data.data.isOnline);

    const agentAssignments = await axios.get(`${API_URL}/agents/assignments`, { headers });
    console.log('Agent Assignments Count:', agentAssignments.data.data.total);

    // SUBSCRIPTIONS APIs
    console.log('\n--- Testing Subscription APIs ---');
    const purchaseSub = await axios.post(`${API_URL}/subscriptions`, {
      planName: 'Gold Laundry Plan',
      itemsLimit: 50,
      validityDays: 30
    }, { headers });
    console.log('Subscription purchased:', purchaseSub.data.data.id);

    const activeSub = await axios.get(`${API_URL}/subscriptions/active`, { headers });
    console.log('Active Subscription Plan:', activeSub.data.data.planName);

    // NOTIFICATIONS APIs
    console.log('\n--- Testing Notification APIs ---');
    const notifs = await axios.get(`${API_URL}/notifications`, { headers });
    console.log('Notifications fetched:', notifs.data.data.total);

    // REVIEWS APIs
    // We cannot fully test reviews without a DELIVERED order, but we can verify the public shop reviews endpoint
    console.log('\n--- Testing Reviews APIs ---');
    const shopReviews = await axios.get(`${API_URL}/reviews/shop/${shopFetch.data.data.id}`);
    console.log('Shop Reviews fetched:', shopReviews.data.data.total);

    console.log('\n✅ All missing endpoints successfully verified from the frontend client!');

  } catch (error: any) {
    console.error('❌ API Verification Failed:', error.response?.data || error.message);
  }
}

verify();
