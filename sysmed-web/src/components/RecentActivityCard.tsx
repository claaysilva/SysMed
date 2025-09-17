import React from "react";

interface RecentActivity {
    type: string;
    title: string;
    description: string;
    created_at: string;
    user: string;
    icon: string;
    color: string;
}

interface RecentActivityCardProps {
    activities: RecentActivity[];
    loading?: boolean;
}

const RecentActivityCard: React.FC<RecentActivityCardProps> = ({
    activities,
    loading = false,
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60 * 60)
        );

        if (diffInHours < 1) {
            return "Agora mesmo";
        } else if (diffInHours < 24) {
            return `${diffInHours}h atrás`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return `${diffInDays}d atrás`;
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
            >
                <h3
                    style={{
                        margin: "0 0 1rem 0",
                        color: "#333",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                    }}
                >
                    Atividade Recente
                </h3>
                <div
                    style={{
                        textAlign: "center",
                        padding: "2rem",
                        color: "#666",
                    }}
                >
                    Carregando atividades...
                </div>
            </div>
        );
    }

    return (
        <div
            style={{
                background: "white",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
        >
            <h3
                style={{
                    margin: "0 0 1rem 0",
                    color: "#333",
                    fontSize: "1.1rem",
                    fontWeight: "600",
                }}
            >
                Atividade Recente
            </h3>

            <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {activities.length === 0 ? (
                    <p
                        style={{
                            textAlign: "center",
                            color: "#666",
                            padding: "2rem",
                        }}
                    >
                        Nenhuma atividade recente
                    </p>
                ) : (
                    activities.map((activity, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "1rem",
                                padding: "0.75rem 0",
                                borderBottom:
                                    index < activities.length - 1
                                        ? "1px solid #f0f0f0"
                                        : "none",
                            }}
                        >
                            <div
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: activity.color,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "1.2rem",
                                    flexShrink: 0,
                                }}
                            >
                                {activity.icon}
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                    style={{
                                        fontWeight: "600",
                                        color: "#333",
                                        fontSize: "0.9rem",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    {activity.title}
                                </div>

                                <div
                                    style={{
                                        color: "#666",
                                        fontSize: "0.85rem",
                                        marginBottom: "0.25rem",
                                        lineHeight: "1.3",
                                    }}
                                >
                                    {activity.description}
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        fontSize: "0.75rem",
                                        color: "#999",
                                    }}
                                >
                                    <span>por {activity.user}</span>
                                    <span>
                                        {formatDate(activity.created_at)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentActivityCard;
