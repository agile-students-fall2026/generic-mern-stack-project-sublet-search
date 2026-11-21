import {Outlet, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import "./Layout.css";

export default function Layout (){
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(
        Number(localStorage.getItem("unreadMessageCount") || 0)
    );

    useEffect(() => {
        function updateUnreadCount() {
            setUnreadCount(
                Number(localStorage.getItem("unreadMessageCount") || 0)
            );
        }

        window.addEventListener("unreadMessagesChanged", updateUnreadCount);
        window.addEventListener("storage", updateUnreadCount);

        return () => {
            window.removeEventListener("unreadMessagesChanged", updateUnreadCount);
            window.removeEventListener("storage", updateUnreadCount);
        };
    }, []);

    return (
        <div className="layout">
            <nav className="layout-nav">
                <p>Sublet Search</p>
                <div className="layout-buttons">
                    <button onClick = {() => navigate("/app/explore")}>
                        Explore
                    </button>
                    <button onClick = {() => navigate("/app/saved")}>
                        Saved
                    </button>
                    <button onClick = {() => navigate("/app/profile")}>
                        Profile
                    </button>
                    <button onClick = {() => navigate("/app/messages")}>
                        Messages <span className="unread-count">{unreadCount}</span>
                    </button>
                    <button onClick = {() => navigate("/app/post")}>
                        Post
                    </button>
                </div>
            </nav>
            <Outlet />
        </div>
    )
}