import React from 'react';
import {
    Redirect,
    Switch,
    useLocation
} from 'react-router';

export function RedirectsSwitch() {
    const location = useLocation();

    return (
        <Switch>
            {/* Magento default restore password url -> Luft default restore password url */}
            <Redirect from="/customer/account/createPassword"
                      to={{...location, pathname: '/account/reset-password'}}/>
        </Switch>
    );
}
