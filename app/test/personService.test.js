import { fetchUsers, createUser, deleteUser } from '../src/domain/services/personService';
import axios from 'axios';

jest.mock('axios');

// Force le mock de la méthode 'delete'
axios.delete = jest.fn();

describe('personService', () => {

    describe('API Configuration', () => {
        const originalEnv = process.env;

        afterEach(() => {
            process.env = { ...originalEnv };
        });

        it('should use JSONPlaceholder when VITE_USE_MOCK_API is true', async () => {
            process.env.VITE_USE_MOCK_API = 'true';

            axios.get.mockResolvedValue({ data: [] });

            await fetchUsers();

            expect(axios.get).toHaveBeenCalledWith(
                'https://jsonplaceholder.typicode.com/users'
            );
        });

        it('should use custom VITE_API_BASE_URL when provided', async () => {
            process.env.VITE_USE_MOCK_API = 'false';
            process.env.VITE_API_BASE_URL = 'http://custom-api:8080';

            axios.get.mockResolvedValue({ data: [] });

            await fetchUsers();

            expect(axios.get).toHaveBeenCalledWith(
                'http://custom-api:8080/users'
            );
        });

        it('should use fallback URL when no environment variables are set', async () => {
            delete process.env.VITE_USE_MOCK_API;
            delete process.env.VITE_API_BASE_URL;

            axios.get.mockResolvedValue({ data: [] });

            await fetchUsers();

            expect(axios.get).toHaveBeenCalledWith(
                'http://127.0.0.1:8000/users'
            );
        });
    });

    describe('fetchUsers', () => {
        it('should return a list of users on success', async () => {
            const mockData = [
                { name: 'John Doe', email: 'john@example.com', address: { city: 'Paris', zipcode: '75001' } }
            ];
            axios.get.mockResolvedValue({ data: mockData });

            const users = await fetchUsers();
            expect(users).toHaveLength(1);
            expect(users[0]).toMatchObject({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                city: 'Paris',
                zip: '75001'
            });
        });

        it('should return a list of users from Python API format', async () => {
            const mockData = {
                utilisateurs: [
                    { firstName: 'Jane', lastName: 'Doe', email: 'jane@example.com', birthDate: '1990-01-01', zip: '69000', city: 'Lyon' }
                ]
            };
            axios.get.mockResolvedValue({ data: mockData });

            const users = await fetchUsers();
            expect(users).toHaveLength(1);
            expect(users[0]).toMatchObject({
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'jane@example.com',
                birthDate: '1990-01-01',
                zip: '69000',
                city: 'Lyon'
            });
        });

        it('should return empty array if data structure is unrecognized', async () => {
            axios.get.mockResolvedValue({ data: { unexpected_field: [] } });
            const users = await fetchUsers();
            expect(users).toEqual([]);
        });

        it('should handle empty name or single word name', async () => {
            const mockData = [
                { name: '', email: 'empty@example.com', address: {} },
                { name: 'Alice', email: 'alice@example.com', address: { city: 'Lyon', zipcode: '69000' } }
            ];
            axios.get.mockResolvedValue({ data: mockData });

            const users = await fetchUsers();

            expect(users[0].firstName).toBe('');
            expect(users[0].lastName).toBe('');
            expect(users[1].firstName).toBe('Alice');
            expect(users[1].lastName).toBe('');
        });

        it('should throw SERVER_ERROR on network failure', async () => {
            axios.get.mockRejectedValue(new Error('Network Error'));
            await expect(fetchUsers()).rejects.toThrow('SERVER_ERROR');
        });

        it('should throw SERVER_ERROR if server returns 500', async () => {
            axios.get.mockRejectedValue({ response: { status: 500 } });
            await expect(fetchUsers()).rejects.toThrow('SERVER_ERROR');
        });
    });

    describe('createUser', () => {
        const person = { email: 'new@example.com', firstName: 'Alice', lastName: 'Smith' };

        it('should create a new user successfully', async () => {
            axios.post.mockResolvedValue({ data: person });

            const result = await createUser(person, []);
            expect(result).toEqual(person);
        });

        it('should create a new user when existingEmails not provided', async () => {
            const person = { email: 'bob@example.com', firstName: 'Bob', lastName: 'Builder' };
            axios.post.mockResolvedValue({ data: person });

            const result = await createUser(person);
            expect(result).toEqual(person);
        });

        it('should throw EMAIL_ALREADY_EXISTS if email exists locally', async () => {
            const existingEmails = ['new@example.com'];
            await expect(createUser(person, existingEmails)).rejects.toThrow('EMAIL_ALREADY_EXISTS');
        });

        it('should throw SERVER_ERROR on network failure', async () => {
            axios.post.mockRejectedValue(new Error('Network Error'));
            await expect(createUser(person, [])).rejects.toThrow('SERVER_ERROR');
        });

        it('should throw SERVER_ERROR if server returns 500', async () => {
            axios.post.mockRejectedValue({ response: { status: 500 } });
            await expect(createUser(person, [])).rejects.toThrow('SERVER_ERROR');
        });

        it('should throw SERVER_ERROR if server returns 400 (simulate backend email validation)', async () => {
            axios.post.mockRejectedValue({ response: { status: 400, data: { message: 'EMAIL_ALREADY_EXISTS' } } });
            await expect(createUser(person, [])).rejects.toThrow('EMAIL_ALREADY_EXISTS');
        });
    });

    describe('deleteUser', () => {
        it('should delete a user successfully', async () => {
            axios.delete.mockResolvedValue({ data: { message: 'USER_DELETED' } });

            await expect(deleteUser(1)).resolves.toBeUndefined();
            expect(axios.delete).toHaveBeenCalledWith(expect.stringContaining('/users/1'));
        });

        it('should throw SERVER_ERROR on network failure', async () => {
            axios.delete.mockRejectedValue(new Error('Network Error'));
            await expect(deleteUser(1)).rejects.toThrow('SERVER_ERROR');
        });

        it('should throw SERVER_ERROR if server returns 500', async () => {
            axios.delete.mockRejectedValue({ response: { status: 500 } });
            await expect(deleteUser(1)).rejects.toThrow('SERVER_ERROR');
        });

        it('should throw SERVER_ERROR if server returns 404 (user not found)', async () => {
            axios.delete.mockRejectedValue({ response: { status: 404, data: { message: 'USER_NOT_FOUND' } } });
            await expect(deleteUser(1)).rejects.toThrow('SERVER_ERROR');
        });
    });

});
