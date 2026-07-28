const assert = require('assert');

const BASE_URL = 'http://localhost:3000';

async function runTests() {
    console.log('Starting integration tests...');

    // Verify if backend server is running first
    try {
        await fetch(`${BASE_URL}/todo`);
    } catch (e) {
        console.error('\n ERROR: The backend server is not running.');
        console.error('Please start the server first by running "npm start" in another terminal before running tests.\n');
        process.exit(1);
    }

    const randomSuffix = Math.floor(Math.random() * 10000);
    const adminEmail = `admin${randomSuffix}@gmail.com`;
    const memberEmail = `member${randomSuffix}@gmail.com`;
    const password = 'Password123';

    let adminToken, memberToken, projectId, taskId;

    // 1. Register Admin
    console.log('Testing: Register Admin User...');
    const registerAdminRes = await fetch(`${BASE_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: `admin${randomSuffix}`,
            email: adminEmail,
            password: password,
            role: 'admin'
        })
    });
    const registerAdminData = await registerAdminRes.json();
    assert.strictEqual(registerAdminRes.status, 201, `Failed to register admin: ${JSON.stringify(registerAdminData)}`);
    console.log('Admin registered.');

    // 2. Register Member
    console.log('Testing: Register Member User...');
    const registerMemberRes = await fetch(`${BASE_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: `memb${randomSuffix}`,
            email: memberEmail,
            password: password,
            role: 'member'
        })
    });
    const registerMemberData = await registerMemberRes.json();
    assert.strictEqual(registerMemberRes.status, 201, `Failed to register member: ${JSON.stringify(registerMemberData)}`);
    console.log('Member registered.');

    // 3. Login Admin
    console.log('Testing: Login Admin...');
    const loginAdminRes = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: adminEmail,
            password: password
        })
    });
    const loginAdminData = await loginAdminRes.json();
    assert.strictEqual(loginAdminRes.status, 200);
    assert.ok(loginAdminData.token);
    adminToken = loginAdminData.token;
    console.log('Admin logged in.');

    // 4. Login Member
    console.log('Testing: Login Member...');
    const loginMemberRes = await fetch(`${BASE_URL}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: memberEmail,
            password: password
        })
    });
    const loginMemberData = await loginMemberRes.json();
    assert.strictEqual(loginMemberRes.status, 200);
    assert.ok(loginMemberData.token);
    memberToken = loginMemberData.token;
    console.log('Member logged in.');

    // 5. Create Project (as Admin)
    console.log('Testing: Create Project...');
    const createProjectRes = await fetch(`${BASE_URL}/projects`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': adminToken
        },
        body: JSON.stringify({
            name: 'Recruitment Project',
            description: 'A test project for full stack evaluation'
        })
    });
    const createProjectData = await createProjectRes.json();
    assert.strictEqual(createProjectRes.status, 201);
    assert.ok(createProjectData.data._id);
    projectId = createProjectData.data._id;
    console.log(`Project created with ID: ${projectId}`);

    // 6. Access Control: Member tries to read project (should fail since member is not in project yet)
    console.log('Testing: Project Access Control (Non-member read)...');
    const readProjectFailRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
        headers: { 'Authorization': memberToken }
    });
    assert.strictEqual(readProjectFailRes.status, 403, 'Member should not access a project they do not own or belong to.');
    console.log('Access control verified: member was denied access.');

    // 7. Add Member to Project (as Admin)
    console.log('Testing: Add Member to Project...');
    const addMemberRes = await fetch(`${BASE_URL}/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': adminToken
        },
        body: JSON.stringify({ email: memberEmail })
    });
    const addMemberData = await addMemberRes.json();
    assert.strictEqual(addMemberRes.status, 200);
    console.log('Member added to project successfully.');

    // 8. Access Control: Member tries to read project again (should succeed now)
    console.log('Testing: Project Access Control (Member read)...');
    const readProjectSuccessRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
        headers: { 'Authorization': memberToken }
    });
    const readProjectSuccessData = await readProjectSuccessRes.json();
    assert.strictEqual(readProjectSuccessRes.status, 200);
    assert.strictEqual(readProjectSuccessData.data._id, projectId);
    console.log('Access control verified: member now has access.');

    // 9. Create Task in Project (as Member)
    console.log('Testing: Create Task (as Member)...');
    const createTaskRes = await fetch(`${BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': memberToken
        },
        body: JSON.stringify({
            title: 'Implement Authentication',
            description: 'Set up JWT token security',
            status: 'To Do',
            priority: 'High',
            project: projectId
        })
    });
    const createTaskData = await createTaskRes.json();
    assert.strictEqual(createTaskRes.status, 201);
    assert.ok(createTaskData.data._id);
    taskId = createTaskData.data._id;
    console.log(`Task created with ID: ${taskId}`);

    // 10. Get Project Tasks with Filter
    console.log('Testing: Get Tasks with Filter...');
    const getTasksRes = await fetch(`${BASE_URL}/tasks?project=${projectId}&status=To Do`, {
        headers: { 'Authorization': memberToken }
    });
    const getTasksData = await getTasksRes.json();
    assert.strictEqual(getTasksRes.status, 200);
    assert.ok(getTasksData.data.length > 0);
    assert.strictEqual(getTasksData.data[0].status, 'To Do');
    console.log('Task filtering by status verified.');

    // 11. Update Task Status (as Member)
    console.log('Testing: Update Task Status...');
    const updateTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': memberToken
        },
        body: JSON.stringify({
            status: 'In Progress'
        })
    });
    const updateTaskData = await updateTaskRes.json();
    assert.strictEqual(updateTaskRes.status, 200);
    assert.strictEqual(updateTaskData.data.status, 'In Progress');
    console.log('Task status updated to In Progress.');

    // 12. Delete Task
    console.log('Testing: Delete Task...');
    const deleteTaskRes = await fetch(`${BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': memberToken }
    });
    assert.strictEqual(deleteTaskRes.status, 200);
    console.log('Task deleted.');

    // 13. Delete Project (as Admin)
    console.log('Testing: Delete Project...');
    const deleteProjectRes = await fetch(`${BASE_URL}/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': adminToken }
    });
    assert.strictEqual(deleteProjectRes.status, 200);
    console.log('Project deleted.');

    console.log('\n ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ');
}

runTests().catch(err => {
    console.error('Test failed with error:', err);
    process.exit(1);
});
