function StatsDashboard({ stats }) {

    function calculateAccountAge(createdAt) {
        const created = new Date(createdAt);
        const now = new Date();

        let years = now.getFullYear() - created.getFullYear();

        const hasHadAnniversary =
            now.getMonth() > created.getMonth() ||
            (
                now.getMonth() === created.getMonth() &&
                now.getDate() >= created.getDate()
            );

        if (!hasHadAnniversary) {
            years--;
        }

        return years;
    }

    const statistics = [
        {
            label: 'PUBLIC REPOSITORIES',
            value: stats.publicRepos
        },
        {
            label: 'TOTAL STARS',
            value: stats.totalStars
        },
        {
            label: 'TOTAL FORKS',
            value: stats.totalForks
        },
        {
            label: 'FOLLOWERS',
            value: stats.followers
        },
        {
            label: 'FOLLOWING',
            value: stats.following
        },
        {
            label: 'YEARS ACTIVE',
            value: calculateAccountAge(stats.createdAt)
        }
    ];

    return (
        <section className="stats-section">

            <div className="section-heading">
                <span>02 / DEVELOPER METRICS</span>
                <h2>Developer Statistics</h2>
                <p>A quantitative look at this developer's GitHub presence.</p>
            </div>

            <div className="stats-grid">

                {statistics.map((stat) => (
                    <article className="stat-card" key={stat.label}>

                        <span className="stat-label">
                            {stat.label}
                        </span>

                        <h3>
                            {stat.value.toLocaleString('en-US')}
                        </h3>

                    </article>
                ))}

            </div>

        </section>
    );
}

export default StatsDashboard;