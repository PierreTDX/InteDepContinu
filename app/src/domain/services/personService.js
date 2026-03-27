import axios from "axios";

/**
 * Determines the base API URL depending on environment variables.
 * If `VITE_USE_MOCK_API` is set to 'true', it returns the JSONPlaceholder URL.
 * Otherwise, it uses `VITE_API_BASE_URL` or defaults to 'http://127.0.0.1:8000'.
 *
 * @function getApiBase
 * @returns {string} The base URL for API requests.
 */
function getApiBase() {
    return process.env.VITE_USE_MOCK_API === 'true'
        ? "https://jsonplaceholder.typicode.com"
        : (process.env.VITE_API_BASE_URL || "http://127.0.0.1:8000");
}

/**
 * Fetches all users from the API.
 * Adapts the response format whether it comes from the mock API (JSONPlaceholder)
 * or the custom Python backend database.
 *
 * @async
 * @function fetchUsers
 * @returns {Promise<Array<{id: number, firstName: string, lastName: string, email: string, birthDate: string, zip: string, city: string}>>} List of mapped users.
 * @throws {Error} Throws "SERVER_ERROR" if the network request fails or server crashes.
 */
export async function fetchUsers() {
    try {
        const response = await axios.get(`${getApiBase()}/users`);

        // Détermine si on reçoit un tableau direct (JSONPlaceholder) ou un objet avec 'utilisateurs' (DB Python)
        const usersList = Array.isArray(response.data) ? response.data : (response.data.utilisateurs || []);

        return usersList.map(u => ({
            id: u.id,
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
 * Deletes a specific user via the API using their ID.
 *
 * @async
 * @function deleteUser
 * @param {number|string} userId - The unique identifier of the user to delete.
 * @returns {Promise<void>} Resolves when the user is successfully deleted.
 * @throws {Error} Throws "SERVER_ERROR" if the deletion fails (e.g., network error, 404, or 500).
 */
export async function deleteUser(userId) {
    try {
        await axios.delete(`${getApiBase()}/users/${userId}`);
    } catch (error) {
        console.error("Erreur dans deleteUser :", error);

        if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
            throw new Error("SERVER_ERROR");
        }

        if (error.response?.status === 404) {
            throw new Error("USER_NOT_FOUND");
        }

        throw error;
    }
}

/**
 * Creates a new user via the API.
 * Performs a local email uniqueness check before sending the request, 
 * and correctly interprets backend 400 status codes for duplicate emails.
 *
 * @async
 * @function createUser
 * @param {Object} person - The user object to create.
 * @param {string} person.firstName - The user's first name.
 * @param {string} person.lastName - The user's last name.
 * @param {string} person.email - The user's email address.
 * @param {string} [person.birthDate] - The user's birth date.
 * @param {string} [person.zip] - The user's zip code.
 * @param {string} [person.city] - The user's city.
 * @param {Array<string>} [existingEmails=[]] - List of currently registered emails to validate against locally.
 * @returns {Promise<Object>} The created user object returned by the API.
 * @throws {Error} Throws "EMAIL_ALREADY_EXISTS" if the email is taken, or "SERVER_ERROR" for other failures.
 */
export async function createUser(person, existingEmails = []) {
    if (existingEmails.includes(person.email.toLowerCase())) {
        throw new Error("EMAIL_ALREADY_EXISTS");
    }

    try {
        const response = await axios.post(`${getApiBase()}/users`, person);
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