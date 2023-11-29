import React, {forwardRef} from 'react';
import {useIntl} from 'react-intl';

import {SelectComponent} from '@luft/common';

import messages from './resources/messages';

export const NamePrefixSelectComponent = forwardRef((props, ref) => {
    const {formatMessage} = useIntl();

    return (
        <SelectComponent {...props}
                         options={[
                             {
                                 code: 'Mr',
                                 name: formatMessage(messages.mister)
                             }, {
                                 code: 'Mrs',
                                 name: formatMessage(messages.missus)
                             }, {
                                 code: 'Miss',
                                 name: formatMessage(messages.miss)
                             }, {
                                 code: 'Sir',
                                 name: formatMessage(messages.sir)
                             }
                         ]}
                         ref={ref}/>
    );
});

NamePrefixSelectComponent.displayName = 'NamePrefixSelectComponent';
