import React, { useState, useEffect } from 'react';

export default function LoadingIndicator() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simple mock loading for 2D assets
        // In a real app, you could use an image loader hook
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return (
        <div className="loading-overlay">
            <div className="loading-bar-container">
                <div
                    className="loading-bar"
                    style={{ width: '100%' }}
                />
            </div>
            <div className="loading-text">Loading Workspace</div>
        </div>
    );
}
