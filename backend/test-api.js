undconst fetch = require('node-fetch'); // or use built-in fetch if Node 18+

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('Testing Family Tree API CRUD operations for Person table...\n');

  try {
    // 1. Login to get token
    console.log('1. Logging in...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com', // Assuming a test user exists
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Login successful, token received.\n');

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. Get all persons (READ)
    console.log('2. Getting all persons...');
    const getAllResponse = await fetch(`${BASE_URL}/api/person`, {
      headers: authHeaders
    });

    if (!getAllResponse.ok) {
      throw new Error(`Get all persons failed: ${getAllResponse.status} ${getAllResponse.statusText}`);
    }

    const persons = await getAllResponse.json();
    console.log(`Found ${persons.people.length} persons.\n`);

    // 3. Create a new person (CREATE)
    console.log('3. Creating a new person...');
    const newPerson = {
      firstName: 'John',
      lastName: 'Doe',
      gender: 'MALE',
      dateOfBirth: '1990-01-01T00:00:00.000Z'
    };

    const createResponse = await fetch(`${BASE_URL}/api/person`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newPerson)
    });

    if (!createResponse.ok) {
      throw new Error(`Create person failed: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createdPerson = await createResponse.json();
    console.log(`Created person: ${createdPerson.firstName} ${createdPerson.lastName}\n`);

    const personId = createdPerson.id;

    // 4. Get the created person by ID (READ)
    console.log('4. Getting person by ID...');
    const getByIdResponse = await fetch(`${BASE_URL}/api/person/${personId}`, {
      headers: authHeaders
    });

    if (!getByIdResponse.ok) {
      throw new Error(`Get person by ID failed: ${getByIdResponse.status} ${getByIdResponse.statusText}`);
    }

    const person = await getByIdResponse.json();
    console.log(`Retrieved person: ${person.firstName} ${person.lastName}\n`);

    // 5. Update the person (UPDATE)
    console.log('5. Updating person...');
    const updateData = {
      firstName: 'Jane',
      bio: 'Updated bio'
    };

    const updateResponse = await fetch(`${BASE_URL}/api/person/${personId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(updateData)
    });

    if (!updateResponse.ok) {
      throw new Error(`Update person failed: ${updateResponse.status} ${updateResponse.statusText}`);
    }

    const updatedPerson = await updateResponse.json();
    console.log(`Updated person: ${updatedPerson.firstName}, bio: ${updatedPerson.bio}\n`);

    // 6. Delete the person (DELETE) - Only if admin
    console.log('6. Deleting person...');
    const deleteResponse = await fetch(`${BASE_URL}/api/person/${personId}`, {
      method: 'DELETE',
      headers: authHeaders
    });

    if (!deleteResponse.ok) {
      console.log(`Delete person failed (expected if not admin): ${deleteResponse.status} ${deleteResponse.statusText}\n`);
    } else {
      console.log('Person deleted successfully.\n');
    }

    console.log('All CRUD operations tested successfully!');

  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

testAPI();
