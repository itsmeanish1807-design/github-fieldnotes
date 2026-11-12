import { useState } from 'react';

function SearchBar({ onSearch }) {

    const [username, setUsername] = useState('');

    function handleSubmit(event) {

        event.preventDefault();

        const trimmedUsername = username.trim();

        if (!trimmedUsername) {
            alert('Please enter a GitHub username.');
            return;
        }

        onSearch(trimmedUsername);
    }

    return (
        <form className="search-box" onSubmit={handleSubmit}>

            <span>@</span>

            <input
                type="text"
                placeholder="Enter GitHub username..."
                value={username}
                onChange={(event) => setUsername(event.target.value)}
            />

            <button type="submit">
                EXPLORE ↗
            </button>

        </form>
    );
}

export default SearchBar;