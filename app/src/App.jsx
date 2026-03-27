/**
 * @file App.jsx
 * Handles routing, global state management for users,
 * and API orchestration.
 */

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Register from "./pages/Register";
import { fetchUsers, createUser } from "./domain/services/personService";
import { errorMessages } from "./utils/errorMessages.js";

/**
 * Main App Component
 *
 * Handles routing, state management for registered persons,
 * and API communication via Axios.
 *
 * @module App
 * @component
 * @returns {JSX.Element} The main application component with routes
 */
function App() {
    const [persons, setPersons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [serverError, setServerError] = useState(null);

    /**
     * Load users from API on component mount.
     */
    useEffect(() => {
        async function loadUsers() {
            setLoading(true);
            try {
                const users = await fetchUsers();
                setPersons(users);
            } catch (error) {
                setServerError(errorMessages.SERVER_ERROR);
            } finally {
                setLoading(false);
            }
        }

        loadUsers();
    }, []);

    /**
     * Add a person to the application state using API service.
     *
     * Delegates business validation (email uniqueness simulation)
     * to the domain service.
     *
     * @async
     * @function addPerson
     * @param {Object} person - Person object to add
     * @throws {Error} Propagates errors thrown by createUser
     */
    const addPerson = async (person) => {
        const existingEmails = persons.map(p => p.email.toLowerCase());
        const newUser = await createUser(person, existingEmails);
        setPersons(prev => [...prev, newUser]);
    };

    /**
     * Remove a person from the application state after successful deletion.
     *
     * @function handleUserDeleted
     * @param {string|number} deletedId - The ID of the deleted person
     */
    const handleUserDeleted = (deletedId) => {
        setPersons(prev => prev.filter(person => String(person.id) !== String(deletedId)));
    };

    return (
        <BrowserRouter basename="/InteDepContinu/">
            <Routes>
                <Route path="/" element={<Home persons={persons} loading={loading} serverError={serverError} onUserDeleted={handleUserDeleted} />} />
                <Route path="/register" element={<Register addPerson={addPerson} />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;