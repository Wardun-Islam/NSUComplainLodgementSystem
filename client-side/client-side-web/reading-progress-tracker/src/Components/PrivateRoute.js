import React from 'react';
import { Redirect, Route } from 'react-router-dom';

export const PrivateRoute = ({ component: Component, ...rest }) => {
    const token = window.localStorage.getItem("token");
    return <Route {...rest} render={(props) => (
        token !== null
            ? <Component {...props}/>
            : <Redirect to={'/signin'}/>
        )} 
    />
}