import React from 'react';

/**
 * UserList Component
 *
 * Displays a list of registered persons. If the list is empty,
 * it shows a default message. Provides a delete button for each user.
 *
 * @module UserList
 * @component
 *
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.persons - Array of person objects to display.
 * @param {function(Object): void} props.onDeleteClick - Callback fired when the delete button is clicked. Passes the person object.
 *
 * @returns {JSX.Element}
 */
export default function UserList({ persons, onDeleteClick }) {
    if (persons.length === 0) {
        return <p data-cy="no-users">Aucun utilisateur inscrit pour l'instant.</p>;
    }

    return (
        <ul data-cy="user-list" className="user-list">
            {persons.map((person, index) => (
                <li key={index}>
                    <span>{person.firstName} {person.lastName} ({person.email})</span>
                    <button
                        onClick={() => onDeleteClick(person)}
                        className="delete-button"
                        title="Supprimer"
                    >
                        ❌
                    </button>
                </li>
            ))}
        </ul>
    );
}