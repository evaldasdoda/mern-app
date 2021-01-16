import React from "react";
import {NavLink} from "react-router-dom";

import './NavLinks.css';

export const NavLinks = () => {
    return (
        <ul className='nav-links'>
            <li>
                <NavLink exact to='/'>All users</NavLink>
            </li>
            <li>
                <NavLink to='/u1/places'>My places</NavLink>
            </li>
            <li>
                <NavLink to='/places/new'>Add place</NavLink>
            </li>
            <li>
                <NavLink to='/auth'>Authenticate</NavLink>
            </li>
        </ul>
    )
}