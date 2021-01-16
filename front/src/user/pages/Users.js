import React from "react";
import {UsersList} from "../components/UsersList";

export const Users = () => {
    const USERS = [
        {id: 'u1', name: 'Name Surname', image: 'https://globalgrasshopper.com/wp-content/uploads/2020/03/most-beautiful-places-to-visit-in-Japan.jpg', places: 3}
    ];
    return (
        <UsersList items={USERS} />
    )
}