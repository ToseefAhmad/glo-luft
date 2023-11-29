import './MaintenancePage.scss';

import React from 'react';
import {useIntl} from 'react-intl';

import icon from 'bat-core/common/src/resources/svg/base/bat-disconnected.svg';
import messages from './resources/messages';

export const MaintenancePage = () => {
    const {formatMessage} = useIntl();

    return (
        <div className="maintenance-page">
            <div className="maintenance-page-body">
                <img className="maintenance-page-icon"
                     src={icon}
                     alt={formatMessage(messages.title)}/>
                <h3 className="maintenance-page-title">
                    {formatMessage(messages.title)}
                </h3>
                <p className="maintenance-page-text">
                    {formatMessage(messages.text)}
                </p>
            </div>
        </div>
    );
};
