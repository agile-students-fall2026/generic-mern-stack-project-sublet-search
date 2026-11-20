const users = [
    {
      id: "user1",
      name: "Nana",
      email: "nana@nyu.edu",
      bio: "CS Junior looking for summer sublets.",
      school: "NYU",
      city: "New York",
      photo: "",
      verifications: {
        eduEmail: true,
        govId: false,
        phone: true,
      },
      savedListingIds: [3],
    },
    {
      id: "user2",
      name: "Morgan",
      email: "morgan@nyu.edu",
      bio: "NYU student looking for housing.",
      school: "NYU",
      city: "New York",
      photo: "",
      verifications: {
          eduEmail: true,
          govId: false,
          phone: false,
      },
      savedListingIds: [],
    }
  ];
  
  export default users;