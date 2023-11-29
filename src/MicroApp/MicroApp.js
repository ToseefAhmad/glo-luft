import './MicroApp.scss';

import React from 'react';

import {LuftIntlProviderComponent} from 'bat-core/boot/src/components/LuftIntlProvider.component';
import {LuftStoresContainer} from 'bat-core/multistore/src/components/LuftStores.container';
import {RestrictAccessBasicContainer} from 'bat-core/restrict-access/src/components/RestrictAccessBasic.container';
import {getStoreCodeByPathname} from 'bat-core/common/src/util/getStoreCodeByPathname';
import type {PredefinedStore} from 'bat-core/multistore';

// Functionality enablement flags
const {
    LUFT_APP_MULTISTORES
} = process.env;

type Props = {
    /**
     * Application start url. Used in static router for ssr.
     */
    url?: string,
    /**
     * List of predefined stores
     */
    stores?: PredefinedStore[]
};

export function MicroApp({url, stores}: Props) {
    const messages = () => {
        const storeCode = getStoreCodeByPathname();

        switch (storeCode) {
            case 'id':
                return import('../translations/micro-id.json');

            case 'ph':
                return import('../translations/micro-ph.json');

            // Use default english translations
            default:
                break;
        }
    };

    return (
        <LuftStoresContainer enabled={LUFT_APP_MULTISTORES}
                             url={url}
                             predefinedStores={stores}>
            <LuftIntlProviderComponent messages={messages}>
                <RestrictAccessBasicContainer/>
            </LuftIntlProviderComponent>
        </LuftStoresContainer>
    );
}
