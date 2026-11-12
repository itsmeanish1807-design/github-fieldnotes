function LanguageFingerprint({ repos }) {

    const languageTotals = {};

    // Calculate total bytes for each language
    repos.forEach((repo) => {
        Object.entries(repo.languages || {}).forEach(([language, bytes]) => {
            languageTotals[language] =
                (languageTotals[language] || 0) + bytes;
        });
    });

    // Calculate total bytes across all languages
    const totalBytes = Object.values(languageTotals)
        .reduce((total, bytes) => total + bytes, 0);

    // Convert language data into percentages
    const languages = Object.entries(languageTotals)
        .map(([name, bytes]) => ({
            name,
            bytes,
            percentage: (bytes / totalBytes) * 100
        }))
        .sort((a, b) => b.bytes - a.bytes);

    if (!totalBytes) {
        return (
            <section className="language-section">
                <div className="section-heading">
                    <span>03 / DEVELOPER DNA</span>
                    <h2>Language Fingerprint</h2>
                </div>
                <p>No language data available.</p>
            </section>
        );
    }

    return (
        <section className="language-section">

            <div className="section-heading">
                <span>03 / DEVELOPER DNA</span>
                <h2>Language Fingerprint</h2>
                <p>Distribution based on actual code written.</p>
            </div>

            <div className="language-list">

                {languages.map((language) => (
                    <div className="language-item" key={language.name}>

                        <div className="language-info">
                            <span>{language.name}</span>
                            <span>
                                {language.percentage.toFixed(1)}%
                            </span>
                        </div>

                        <div className="language-track">
                            <div
                                className="language-fill"
                                style={{
                                    width: `${language.percentage}%`
                                }}
                            />
                        </div>

                    </div>
                ))}

            </div>

        </section>
    );
}

export default LanguageFingerprint;