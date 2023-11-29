import React, {useState} from 'react';
import {noop, isEmpty} from 'lodash';
import {useIntl} from 'react-intl';

import {
    BackComponent,
    ButtonComponent,
    ErrorComponent,
    useResolutions
} from '@luft/common';
import {
    LoginNavControlComponent,
    RegisterFormComponent,
    SocialProvidersContainer
} from '@luft/user';
import type {RegisterInput} from '@luft/types';
import messages from '@luft/user/src/components/Register.component/resources/messages';

import {AgeVerificationContainer} from 'bat-core/restrict-access';

import custom_messages from '../../../../../user/components/Register.component/resources/messages';

type Props = {
    error?: Error,
    loading?: boolean,
    registerInput?: RegisterInput,
    isEmailPredefined?: boolean,
    isSocialRegister?: boolean,
    referralCode?: string,
    isAzureEnabled?: boolean,
    onRegister?: Function,
    onNavigateLogin?: Function
}

export function RegisterComponent(props: Props) {
    const {formatMessage} = useIntl();

    const {
        error,
        loading,
        registerInput = {},
        isEmailPredefined = false,
        isSocialRegister = false,
        referralCode = '',
        isAzureEnabled = false,
        onRegister = noop,
        onNavigateLogin,
        ...other
    } = props;
    const {order_ids} = registerInput;

    const {isSMdown} = useResolutions();
    const [userVerifiedData, setUserVerifiedData] = useState({});

    const handleVerify = (data) => {
        setUserVerifiedData(data);
    };

    return (
        <div className="register-component">
            {isAzureEnabled && (
                <AgeVerificationContainer showModal={isEmpty(userVerifiedData)}
                                          onVerify={handleVerify}
                                          onBack={onNavigateLogin}/>
            )}

            {isSMdown ? (
                <BackComponent title={formatMessage(messages.register)}
                               onBack={onNavigateLogin}
                               variant="header"/>
            ) : (
                <h3 className="register-component-title">
                    {formatMessage(messages.register)}
                </h3>
            )}

            {error && <ErrorComponent error={error}/>}

            {!isEmpty(userVerifiedData) && (
                <div className="register-component-age">
                    <p>
                        {formatMessage(custom_messages.check_note)}
                    </p>
                    <p className="register-component-verify-name">
                        {`${userVerifiedData.first_name} ${userVerifiedData.last_name}`}
                    </p>
                    <p className="register-component-verify-text">
                        {formatMessage(custom_messages.verify_note)}
                        <ButtonComponent className="register-component-reverify"
                                         variant="link"
                                         inline={true}
                                         type="button"
                                         onClick={() => setUserVerifiedData({})}
                                         title={formatMessage(custom_messages.link_title)}>
                            {formatMessage(custom_messages.link_title)}
                        </ButtonComponent>
                    </p>
                    <p>
                        {formatMessage(custom_messages.fix_note)}
                    </p>
                </div>
            )}

            <RegisterFormComponent onRegister={onRegister}
                                   loading={loading}
                                   registerInput={registerInput}
                                   isEmailPredefined={isEmailPredefined}
                                   isSocialRegister={isSocialRegister}
                                   referralCode={referralCode}
                                   userVerifiedData={userVerifiedData}
                                   {...other}/>

            <LoginNavControlComponent onNavigate={onNavigateLogin}/>
            {!isSocialRegister && <SocialProvidersContainer orderIds={order_ids}
                                                            referralCode={referralCode}/>}
        </div>
    );
}
