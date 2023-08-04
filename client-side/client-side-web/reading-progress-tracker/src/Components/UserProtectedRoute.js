import React from 'react';
import { Redirect, Route } from 'react-router-dom';

export const UserProtectedRoute = ({ component: Component, ...rest }) => {
    const token = window.localStorage.getItem("token");
    return <Route {...rest} render={(props) => (
        token === null
            ? <Component {...props}/>
            : <Redirect to={'/home'}/>
        )} 
    />
}