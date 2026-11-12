function ActivityTimeline({ activities }) {

    function formatDate(dateString) {
        return new Date(dateString).toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    if (!activities || activities.length === 0) {
        return (
            <section className="activity-section">

                <div className="section-heading">
                    <span>05 / RECENT MOVEMENTS</span>
                    <h2>Activity Timeline</h2>
                </div>

                <p className="activity-empty">
                    No recent public activity available.
                </p>

            </section>
        );
    }

    return (

        <section className="activity-section">

            <div className="section-heading">
                <span>05 / RECENT MOVEMENTS</span>
                <h2>Activity Timeline</h2>
                <p>Recent public interactions across GitHub.</p>
            </div>

            <div className="timeline">

                {activities.map((activity) => (

                    <article
                        className="timeline-item"
                        key={activity.id}
                    >

                        <div className="timeline-marker">
                            <span></span>
                        </div>

                        <div className="timeline-content">

                            <div className="timeline-top">

                                <span className="activity-category">
                                    {activity.category}
                                </span>

                                <time>
                                    {formatDate(activity.createdAt)}
                                </time>

                            </div>

                            <p className="activity-description">
                                {activity.action}
                            </p>

                            <a
                                href={activity.repositoryUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="activity-repository"
                            >
                                {activity.repository} ↗
                            </a>

                        </div>

                    </article>

                ))}

            </div>

        </section>

    );
}

export default ActivityTimeline;