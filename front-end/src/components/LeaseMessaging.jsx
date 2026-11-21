import { useEffect, useState } from "react";
import "./LeaseMessaging.css";

export default function LeaseMessaging({
    conversationId,
    currentUserId,
    otherUserName,
    onBack
}) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => {
        async function loadMessages() {
            setLoading(true);
            setError("");

            try {
                const response = await fetch(
                    `/api/conversations/${conversationId}/messages`,
                    { headers: { "x-user-id": currentUserId } }
                );

                if (!response.ok) {
                    throw new Error("Could not load messages.");
                }

                const conversation = await response.json();
                setMessages(conversation.messages);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadMessages();
    }, [conversationId, currentUserId]);

    async function handleSend(e) {
        e.preventDefault();

        if (message.trim() === "") {
            return;
        }

        setSending(true);
        setError("");

        try {
            const response = await fetch(
                `/api/conversations/${conversationId}/messages`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-user-id": currentUserId
                    },
                    body: JSON.stringify({
                        sender: currentUserId,
                        content: message.trim()
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Could not send message.");
            }

            const newMessage = await response.json();
            setMessages((currentMessages) => [...currentMessages, newMessage]);
            setMessage("");
        } catch (err) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="lease-messaging">
            <button type="button" onClick={onBack}>Back to messages</button>
            <h2>{otherUserName}</h2>

            <div className="message-box">
                {loading && <p>Loading messages...</p>}
                {!loading && messages.length === 0 && <p>No messages yet.</p>}

                {messages.map((item, index) => (
                    <p
                        key={`${item.date}-${index}`}
                        className={`message ${
                            item.sender === currentUserId
                                ? "sent-by-me"
                                : "sent-by-other"
                        }`}
                    >
                        {item.content}
                    </p>
                ))}
            </div>

            {error && <p>{error}</p>}

            <form onSubmit={handleSend} className="message-form">
                <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" disabled={sending}>
                    {sending ? "Sending..." : "Send"}
                </button>
            </form>
        </div>
    );
}

