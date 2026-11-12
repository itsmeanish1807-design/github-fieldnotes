function ProfileCard({ profile }) {

    return (
        <div className="profile-card">

            <div className="profile-header">

                <img
                    src={profile.avatar_url}
                    alt={`${profile.login}'s avatar`}
                    className="avatar"
                />

                <div>
                    <h2>{profile.name || profile.login}</h2>
                    <p>@{profile.login}</p>
                </div>

            </div>

            <p className="bio">
                {profile.bio || 'No bio available.'}
            </p>

            <div className="profile-stats">

                <div>
                    <strong>{profile.public_repos}</strong>
                    <span>Repositories</span>
                </div>

                <div>
                    <strong>{profile.followers}</strong>
                    <span>Followers</span>
                </div>

                <div>
                    <strong>{profile.following}</strong>
                    <span>Following</span>
                </div>

            </div>

            <a
                href={profile.html_url}
                target="_blank"
                rel="noreferrer"
                className="github-link"
            >
                VIEW GITHUB PROFILE ↗
            </a>

        </div>
    );
}

export default ProfileCard;