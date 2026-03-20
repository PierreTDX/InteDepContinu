import axios from "axios";

/**
 * Base API URL. 
 * Set VITE_USE_MOCK_API=true in your .env file or docker-compose to use JSONPlaceholder.
 */
const USE_MOCK = import.meta.env.VITE_USE_MOCK_API === 'true';
const API_BASE = USE_MOCK
    ? "https://jsonplaceholder.typicode.com"
    : (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000");

/**
 * Fetch all users from the API.
 *
 * @async
 * @function fetchUsers
 * @returns {Promise<Array>} List of users
 * @throws {Error} Throws "SERVER_ERROR" if request fails
 */
export async function fetchUsers() {
    try {
        const response = await axios.get(`${API_BASE}/users`);

        // Détermine si on reçoit un tableau direct (JSONPlaceholder) ou un objet avec 'utilisateurs' (DB Python)
        const usersList = Array.isArray(response.data) ? response.data : (response.data.utilisateurs || []);

        return usersList.map(u => ({
            firstName: u.firstName || (u.name ? u.name.split(' ')[0] : '') || '',
            lastName: u.lastName || (u.name ? u.name.split(' ')[1] : '') || '',
            email: u.email,
            birthDate: u.birthDate || '',
            zip: u.zip || u.address?.zipcode || '',
            city: u.city || u.address?.city || ''
        }));
    } catch (error) {
        console.error("Erreur dans fetchUsers :", error);
        throw new Error("SERVER_ERROR");
    }
}

/**
 * Create a new user via API.
 * Performs local email uniqueness check to simulate business validation.
 *
 * @async
 * @function createUser
 * @param {Object} person - User object to create
 * @param {Array<string>} existingEmails - List of already registered emails
 * @returns {Promise<Object>} Created user
 * @throws {Error} Throws "EMAIL_ALREADY_EXISTS" or "SERVER_ERROR"
 */
export async function createUser(person, existingEmails = []) {
    if (existingEmails.includes(person.email.toLowerCase())) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    try {
        const response = await axios.post(`${API_BASE}/users`, person);
        return response.data;
    } catch (error) {
        const status = error.response?.status;

        if (status === 400 && error.response.data?.message === "EMAIL_ALREADY_EXISTS") {
            throw new Error("EMAIL_ALREADY_EXISTS");
        }

        if (status >= 500 && status < 600) {
            throw new Error("SERVER_ERROR");
        }

        console.error("Erreur dans createUser :", error);
        throw new Error("SERVER_ERROR");
    }
}