import LeaseMessaging from "../components/LeaseMessaging";
import ChatDashboardElement from "../components/ChatDashboardElement"
import "./Messages.css";

import { useEffect, useState } from "react";

export default function Messages(){
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const currentUserId = storedUser?.id || "user1";
    const [conversations, setConversations] = useState([]);
    const [currentConversation, setCurrentConversation] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadConversations() {
            try {
                const response = await fetch("/api/conversations", {
                    headers: { "x-user-id": currentUserId }
                });

                if (!response.ok) {
                    throw new Error("Could not load conversations.");
                }

                const data = await response.json();
                setConversations(data);
            } catch (err) {
                setError(err.message);
            }
        }

        loadConversations();
    }, [currentUserId]);

    function getUserName(userId) {
        if (userId === "user1") {
            return "Alice Johnson";
        }
        if (userId === "user2") {
            return "Bob Smith";
        }
        return userId;
    }

    if (currentConversation) {
        const otherUserId =
            currentConversation.userOne === currentUserId
                ? currentConversation.userTwo
                : currentConversation.userOne;

        return (
            <LeaseMessaging
                conversationId={currentConversation.conversationId}
                currentUserId={currentUserId}
                otherUserName={getUserName(otherUserId)}
                onBack={() => setCurrentConversation(null)}
            />
        );
    }

    return (
        <div className="messages-page">
            <h2>Messages</h2>
            {error && <p>{error}</p>}
            {!error && conversations.length === 0 && <p>No conversations.</p>}
            <ul className="conversation-list">
                {conversations.map((conversation) => {
                    const otherUserId =
                        conversation.userOne === currentUserId
                            ? conversation.userTwo
                            : conversation.userOne;

                    return (
                    <li key={conversation.conversationId}>
                        <ChatDashboardElement
                            sublessor={getUserName(otherUserId)}
                            subletName="Open conversation"
                            lastActive=""
                            onOpen={() => setCurrentConversation(conversation)}
                        />
                    </li>
                    );
                })}
            </ul>
        </div>
    );
}