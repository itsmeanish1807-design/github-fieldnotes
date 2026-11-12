function RepoList({ repos }) {

    if (!repos.length) {
        return <p>No public repositories found.</p>;
    }

    return (
        <section className="repo-section">

            <div className="section-heading">
                <span>02 / SELECTED WORK</span>
                <h2>Top 5 Repositories</h2>
            </div>

            <div className="repo-grid">

                {repos.map((repo) => (

                    <article className="repo-card" key={repo.id}>

                        <div className="repo-top">
                            <h3>{repo.name}</h3>

                            <span className="repo-visibility">
                                PUBLIC
                            </span>
                        </div>

                        <p className="repo-description">
                            {repo.description || 'No description provided.'}
                        </p>

                        <div className="repo-meta">

                            <span>
                                ● {repo.language || 'Other'}
                            </span>

                            <span>
                                ★ {repo.stargazers_count}
                            </span>

                            <span>
                                ⑂ {repo.forks_count}
                            </span>

                        </div>

                        <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            EXPLORE REPOSITORY ↗
                        </a>

                    </article>

                ))}

            </div>

        </section>
    );
}

export default RepoList;