import React from 'react';

import {SocialLoginContainer} from '@luft/user';

import {useSocialLoginAction} from 'bat-core/user';

export function UserSocialLoginPage() {
    const onSocialLogin = useSocialLoginAction();

    return (
        <div className="social-login-page">
            <SocialLoginContainer onLogin={onSocialLogin}/>
        </div>
    );
}
