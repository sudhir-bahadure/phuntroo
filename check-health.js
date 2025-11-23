import fetch from 'node-fetch';

const BACKEND_URL = 'https://phuntroo-backend.onrender.com';

async function checkHealth() {
    console.log(`🔍 Checking health of ${BACKEND_URL}...`);
    try {
        const response = await fetch(`${BACKEND_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Backend is HEALTHY!');
            console.log('Details:', JSON.stringify(data, null, 2));
        } else {
            console.error(`❌ Backend returned status: ${response.status}`);
        }
    } catch (error) {
        console.error('❌ Failed to connect to backend:', error.message);
    }
}

checkHealth();
