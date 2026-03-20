import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { toast, ToastContainer } from "react-toastify";
import ConfirmModal from '../components/ConfirmModal';
import { deleteUser } from '../domain/services/personService';
import { getErrorMessage } from '../utils/errorMessages';

/**
 * Home Component
 *
 * Displays the list of registered persons and a button to navigate to the registration form.
 *
 * @module Home
 * @component
 *
 * @param {Object} props
 * @param {Array<Object>} props.persons - Array of person objects to display
 * @param {function(string|number): void} [props.onUserDeleted] - Callback when a user is deleted
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

    const handleDeleteClick = (person) => {
        setPersonToDelete(person);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!personToDelete) return;
        try {
            await deleteUser(personToDelete.id);
            toast.success(getErrorMessage("USER_DELETED"));
            if (onUserDeleted) {
                onUserDeleted(personToDelete.id);
            } else {
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (error) {
            toast.error(getErrorMessage("SERVER_ERROR"));
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
                    {persons.length > 0 ? (
                        <ul data-cy="user-list" className="user-list">
                            {persons.map((person, index) => (
                                <li key={index}>
                                    <span>{person.firstName} {person.lastName} ({person.email})</span>
                                    <button
                                        onClick={() => handleDeleteClick(person)}
                                        className="delete-button"
                                        title="Supprimer"
                                    >
                                        ❌
                                    </button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p data-cy="no-users">Aucun utilisateur inscrit pour l'instant.</p>
                    )}
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