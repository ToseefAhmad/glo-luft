import React from 'react';
import {
    Switch,
    Route,
    Redirect,
    useRouteMatch,
    useHistory,
    useLocation
} from 'react-router';
import {useLastLocation} from 'react-router-last-location';

import {useGoBack, useStoreConfigQuery} from '@luft/common';
import {
    LoginContainer,
    RegisterContainer,
    ForgotPasswordContainer,
    ResetPasswordContainer,
    useIsAuthorized
} from '@luft/user';

import {AccountConfirmContainer, getReferralManager} from 'bat-core/user';

// Do not redirect here in case of successful authorization
const SKIPPED_REDIRECT_PATHS = [
    '/account/login',
    '/account/register',
    '/account/confirm',
    '/account/forgot-password',
    '/account/reset-password',
    '/connect/social-login',
    '/connect/social-login/checkout'
];

const isSkippedRedirectPath = lastLocation => {
    if (!lastLocation) return true;

    return SKIPPED_REDIRECT_PATHS.includes(lastLocation.pathname);
};

// This is something like an aggregation component,
// that provides all authorization logic. Can be copypasted to any other component and modified
export function AuthorizeSwitch() {
    const {path} = useRouteMatch();
    const history = useHistory();
    const {state} = useLocation();
    const lastLocation = useLastLocation();
    const goBack = useGoBack();
    const {data: storeConfigData} = useStoreConfigQuery();
    const isAuthorized = useIsAuthorized();
    const {getCode} = getReferralManager();

    const isDisabledRegistration = storeConfigData?.storeConfig?.is_registration_disabled;
    const {from, email} = state || {};
    const referralCode = lastLocation && getCode(lastLocation.pathname);

    const navigateAccount = (stateData) => history.replace(path, stateData);
    const navigateLogin = () => history.replace(`${path}/login`, {email});
    const navigateRegister = (fromPath) => history.replace(`${path}/register`, {from: fromPath});
    const navigateForgotPassword = () => history.replace(`${path}/forgot-password`, {email});

    const navigateAuthorize = () => {
        if (referralCode) return navigateAccount();
        if (from || !isSkippedRedirectPath(lastLocation)) return history.push(from || lastLocation);

        navigateAccount();
    };

    const handleOnContinueAsGuest = () => (from ? history.push(from) : goBack());
    const handleResetPassword = isAuthorized ? navigateAccount : navigateLogin;

    return (
        <Switch>
            <Route path={`${path}/login`}
                   render={() => (<LoginContainer onLogin={navigateAuthorize}
                                                  email={email}
                                                  onBack={() => goBack()}
                                                  onContinueAsGuest={handleOnContinueAsGuest}
                                                  onNavigateRegister={navigateRegister}
                                                  referralCode={referralCode}
                                                  onNavigateForgotPassword={navigateForgotPassword}/>)}/>
            {!isDisabledRegistration && (
                <Route path={`${path}/register`}
                       render={() => (
                           <RegisterContainer onRegister={navigateAuthorize}
                                              onNavigateLogin={navigateLogin}/>
                       )}/>
            )}
            <Route path={`${path}/forgot-password`}
                   render={() => <ForgotPasswordContainer onNavigateLogin={navigateLogin}/>}/>
            <Route path={`${path}/reset-password`}
                   render={() => (
                       <ResetPasswordContainer onBack={navigateLogin}
                                               onResetPassword={handleResetPassword}
                                               onNavigateForgotPassword={navigateForgotPassword}/>
                   )}/>
            <Route path={`${path}/confirm`}
                   render={() => (
                       <AccountConfirmContainer onBack={navigateLogin}/>
                   )}/>
            <Redirect to={{pathname: `${path}/login`}}/>
        </Switch>
    );
}
