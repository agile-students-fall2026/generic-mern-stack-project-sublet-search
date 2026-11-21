const conversationsMockData = [
    {
        conversationId: 1,
        userOne: "user1",
        userTwo: "user2",
        messages: [
            {
                sender: "user1",
                date: new Date("November 14, 2026 03:24:00"),
                content: "Hi Bob, is your sublet still available?",
                userOneRead: true,
                userTwoRead: true
            },
            {
                sender: "user2",
                date: new Date("November 14, 2026 03:25:00"),
                content: "Hi Alice! Yes, it is still available.",
                userOneRead: false,
                userTwoRead: true
            }
        ]
    }
];

export default conversationsMockData;