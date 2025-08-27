// Test script for Authentication APIs
// Run this after starting the server to test the endpoints

const BASE_URL = 'http://localhost:5000/api/auth';

async function testAuthAPI() {
    console.log('🧪 Testing Authentication API...\n');

    // Test data
    const testUser = {
        email: 'test@example.com',
        username: 'testuser',
        full_name: 'Test User',
        phone: '+1234567890',
        password: 'testpassword123'
    };

    let token = '';

    try {
        // 1. Test Registration
        console.log('1. Testing Registration...');
        const registerResponse = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testUser)
        });
        
        const registerResult = await registerResponse.json();
        console.log('Register Response:', registerResult);
        
        if (registerResult.success) {
            token = registerResult.token;
            console.log('✅ Registration successful\n');
        } else {
            console.log('❌ Registration failed\n');
        }

        // 2. Test Login
        console.log('2. Testing Login...');
        const loginResponse = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                emailOrUsername: testUser.email,
                password: testUser.password
            })
        });
        
        const loginResult = await loginResponse.json();
        console.log('Login Response:', loginResult);
        
        if (loginResult.success) {
            token = loginResult.token;
            console.log('✅ Login successful\n');
        } else {
            console.log('❌ Login failed\n');
        }

        // 3. Test Get Profile
        console.log('3. Testing Get Profile...');
        const profileResponse = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });
        
        const profileResult = await profileResponse.json();
        console.log('Profile Response:', profileResult);
        
        if (profileResult.success) {
            console.log('✅ Get profile successful\n');
        } else {
            console.log('❌ Get profile failed\n');
        }

        // 4. Test Update Profile
        console.log('4. Testing Update Profile...');
        const updateResponse = await fetch(`${BASE_URL}/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                full_name: 'Updated Test User',
                phone: '+9876543210'
            })
        });
        
        const updateResult = await updateResponse.json();
        console.log('Update Profile Response:', updateResult);
        
        if (updateResult.success) {
            console.log('✅ Update profile successful\n');
        } else {
            console.log('❌ Update profile failed\n');
        }

        // 5. Test Change Password
        console.log('5. Testing Change Password...');
        const changePasswordResponse = await fetch(`${BASE_URL}/change-password`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentPassword: testUser.password,
                newPassword: 'newpassword456'
            })
        });
        
        const changePasswordResult = await changePasswordResponse.json();
        console.log('Change Password Response:', changePasswordResult);
        
        if (changePasswordResult.success) {
            console.log('✅ Change password successful\n');
        } else {
            console.log('❌ Change password failed\n');
        }

        console.log('🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Instructions
console.log(`
📋 Instructions to test:
1. Start the server: npm run dev
2. Open another terminal
3. Run: node test/auth-test.js

Note: Make sure your database is running and configured properly.
`);

// Uncomment the line below to run the test
// testAuthAPI();
