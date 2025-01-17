// @ts-check
const { test, expect } = require('@playwright/test');

const statusCodes = require("../src/lib/variables/enum");

const baseUrl = "https://restful-api.dev/";
let createdObjectId;

test.describe('API Tests', () => {

    // 1. Test to get a list of all objects
    test('Get List of all objects', async ({ request }) => {
        console.log("------------------| TEST_01 |------------------------------------");

        const response = await request.get(`${baseUrl}objects`);

        console.log("Response status:", response.status());
        expect(response.status()).toBe(statusCodes.STATUS_CODE_SUCCESS);

        const objects = await response.json();
        console.log("Response body:", objects);

        // Assert that the list is not empty
        expect(objects.length).toBeGreaterThan(0);

        // Check if the first object contains the expected data
        const firstObject = objects[0];

        expect(firstObject).toHaveProperty('id');
        expect(firstObject).toHaveProperty('name');
        expect(firstObject).toHaveProperty('data');

        // Assert that the first object matches the expected values
        expect(firstObject).toEqual({
            id: "1",
            name: "Google Pixel 6 Pro",
            data: {
                color: "Cloudy White",
                capacity: "128 GB"
            }
        });

    });

    // 2. Test to add an object using POST
    test('Add object', async ({ request }) => {
        console.log("------------------| TEST_02 |------------------------------------");

        const response = await request.post(`${baseUrl}objects`, {
            data: {
                "name": "Apple MacBook Pro 18",
                "data": {
                    "year": 2019,
                    "price": 1849.99,
                    "CPU model": "Intel Core i9",
                    "Hard disk size": "1 TB"
                }
            }
        });

        console.log("Response status:", response.status());
        expect(response.status()).toBe(statusCodes.STATUS_CODE_SUCCESS);

        const object = await response.json();

        console.log("Response body:", object);

        // Check the 'name', 'createdAt' and 'data' properties in the response object
        expect(object.name).toBeDefined();
        expect(object.name).toBe("Apple MacBook Pro 18");

        expect(object.data).toBeDefined();
        expect(object.data).toEqual({
            year: 2019,
            price: 1849.99,
            "CPU model": "Intel Core i9",
            "Hard disk size": "1 TB"
        });

        expect(object.createdAt).toBeDefined();
        createdObjectId = object.id;
    });

    // 3. Test to get a single object using the added ID
    test('Get a single object by ID', async ({ request }) => {
        console.log("------------------| TEST_03 |------------------------------------");

        const response = await request.get(`${baseUrl}objects/${createdObjectId}`);

        console.log("Response status:", response.status());
        expect(response.status()).toBe(statusCodes.STATUS_CODE_SUCCESS);

        const object = await response.json();
        console.log("Response body:", object);

        // Assert the object returned matches the created object data
        expect(object.id).toBe(createdObjectId);
        expect(object.name).toBe("Apple MacBook Pro 18");
        expect(object.data).toEqual({
            year: 2019,
            price: 1849.99,
            "CPU model": "Intel Core i9",
            "Hard disk size": "1 TB"
        });

    });

    //4. Test to update the object added in Step 2
    test('Update the object using PUT', async ({ request }) => {
        console.log("------------------| TEST_04 |------------------------------------");

        const response = await request.put(`${baseUrl}objects/${createdObjectId}`, {
            data: {
                "name": "Apple MacBook Pro 18 Updated",
                "data": {
                    "year": 2020,
                    "price": 1999.99,
                    "CPU model": "Intel Core i9",
                    "Hard disk size": "1 TB",
                    "color": "silver"
                }
            }
        });

        console.log("Response status:", response.status());
        expect(response.status()).toBe(statusCodes.STATUS_CODE_SUCCESS);

        const object = await response.json();
        console.log("Response body:", object);

        // Assert that the object has been updated
        expect(object.name).toBe("Apple MacBook Pro 18 Updated");
        expect(object.data).toEqual({
            year: 2020,
            price: 1999.99,
            "CPU model": "Intel Core i9",
            "Hard disk size": "1 TB",
            "color": "silver"
        });

        expect(object.updatedAt).toBeDefined();
    });

    // 5. Test to partially update the object using PATCH
    test('Partially update the object using PATCH', async ({ request }) => {
        console.log("------------------| TEST_05 |------------------------------------");

        const response = await request.patch(`${baseUrl}objects/${createdObjectId}`, {
            data: {
                "name": "Apple MacBook Pro 16 (Updated Name)"
            }
        });

        console.log("Response status:", response.status());
        expect(response.status()).toBe(statusCodes.STATUS_CODE_SUCCESS);

        const object = await response.json();
        console.log("Response body:", object);

        // Assert that only the name has been updated
        expect(object.name).toBe("Apple MacBook Pro 16 (Updated Name)");

        expect(object.data).toEqual({
            year: 2020,
            price: 1999.99,
            "CPU model": "Intel Core i9",
            "Hard disk size": "1 TB",
            "color": "silver"
        });

        expect(object.updatedAt).toBeDefined();
    });

    // 6. Test to delete the object using DELETE
    test('Delete the object', async ({ request }) => {
        console.log("------------------| TEST_06 |------------------------------------");

        const response = await request.delete(`${baseUrl}objects/${createdObjectId}`);

        console.log("Response status:", response.status());
        expect(response.status()).toBe(statusCodes.STATUS_CODE_SUCCESS);

        // Check the response message
        const responseBody = await response.json();
        console.log("Response body:", responseBody);

        // Assert that the message in the response is as expected
        expect(responseBody).toHaveProperty('message');
        expect(responseBody.message).toBe(`Object with id = ${createdObjectId} has been deleted.`);

        // Verify if the object was deleted
        const getResponse = await request.get(`${baseUrl}objects/${createdObjectId}`);
        console.log("Get response status after delete:", getResponse.status());
        expect(getResponse.status()).toBe(statusCodes.STATUS_CODE_NOT_FOUND);
    });

});
