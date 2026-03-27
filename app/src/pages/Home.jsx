/**
 * @file Home.jsx
 * Main landing page component displaying the user list and deletion functionality.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { toast, ToastContainer } from "react-toastify";
import ConfirmModal from '../components/ConfirmModal';
import { deleteUser } from '../domain/services/personService';
import { getErrorMessage } from '../utils/errorMessages';
import UserList from '../components/UserList';

/**
 * Home Component
 *
 * Displays the list of registered persons and a button to navigate to the registration form.
 * Includes a modal to confirm user deletion and handles the deletion process.
 *
 * @module Home
 * @component
 *
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.persons - Array of person objects to display.
 * @param {boolean} [props.loading] - Indicates if the user list is currently loading.
 * @param {string|null} [props.serverError] - Error message to display if fetching users failed.
 * @param {function((string|number)): void} props.onUserDeleted - Callback when a user is deleted.
 *
 * @returns {JSX.Element}
 */
export default function Home({ persons, loading, serverError, onUserDeleted }) {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [personToDelete, setPersonToDelete] = useState(null);

    /**
     * Navigate to the registration form.
     * @module Home
     * @function handleGoToForm
     * @private
     */
    const handleGoToForm = () => {
        navigate('/register');
    };

    /**
     * Handles the click event on the delete button for a specific user.
     * Opens the confirmation modal and sets the selected person for deletion.
     * 
     * @function handleDeleteClick
     * @private
     * @param {Object} person - The person object to be deleted.
     */
    const handleDeleteClick = (person) => {
        setPersonToDelete(person);
        setIsModalOpen(true);
    };

    /**
     * Handles the confirmation of user deletion from the modal.
     * Calls the API to delete the user, displays a toast notification, 
     * and triggers the parent callback or reloads the page.
     * 
     * @async
     * @function handleConfirmDelete
     * @private
     * @returns {Promise<void>}
     */
    const handleConfirmDelete = async () => {
        if (!personToDelete) return;
        try {
            await deleteUser(personToDelete.id);
            toast.success(getErrorMessage("USER_DELETED"));
            onUserDeleted(personToDelete.id);
        } catch (error) {
            if (error.message === "USER_NOT_FOUND") {
                toast.warn(getErrorMessage("USER_NOT_FOUND"));
                onUserDeleted(personToDelete.id);
            } else {
                toast.error(getErrorMessage("SERVER_ERROR"));
            }
        } finally {
            setIsModalOpen(false);
            setPersonToDelete(null);
        }
    };

    if (serverError) {
        if (!toast.isActive("server-error")) {
            toast.error(serverError, {
                toastId: "server-error",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false
            });
        }
    }

    if (loading) {
        return (
            <div className="home-container">
                <div className="card">
                    <h1>Bienvenue</h1>
                    <p>Chargement des utilisateurs...</p>
                </div>
                <ToastContainer position="top-right" />
            </div>
        );
    }

    return (
        <div className="home-container">
            <div className="card">
                <h1>Bienvenue</h1>
                <p>
                    Nombre d'utilisateurs inscrits :{" "}
                    <strong data-cy="user-count">{persons.length}</strong>
                </p>
                <button data-cy="nav-register" onClick={handleGoToForm}>
                    Inscription
                </button>
                <div className="user-table-container">
                    <h3>Liste des utilisateurs inscrits</h3>
                    <UserList persons={persons} onDeleteClick={handleDeleteClick} />
                </div>
            </div>
            <ToastContainer position="top-right" />
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Confirmer la suppression"
            >
                <p>Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{personToDelete?.firstName} {personToDelete?.lastName}</strong> ?</p>
                <p>Cette action est irréversible.</p>
            </ConfirmModal>
        </div>
    );
}