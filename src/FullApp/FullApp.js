import './FullApp.scss';

import React from 'react';

import {LuftBootComponent} from '@luft/boot';
import {
    PersistedQueryLink,
    useIsInternalServerError,
    useInternalServerErrorLink
} from '@luft/apollo';
import {LoaderComponent, useResolutions} from '@luft/common';
import {useAuthLink} from '@luft/user';

import {EspayRendererContainer} from 'bat-core/espay';
import {
    CartItemContainer,
    MiniCartProviderComponent,
    cartErrorLink
} from 'bat-core/cart';
import {MenuProviderComponent} from 'bat-core/catalog';
import {
    StoreConfigContainer,
    getStoreCodeByPathname,
    getMergedTranslationMessages
} from 'bat-core/common';
import {getPaynamicsMethodsRenderer} from 'bat-core/paynamics';
import {ProductPreviewAltComponent, ProductPaneComponent} from 'bat-core/product';
import {PageBuilderComponent} from 'bat-core/page-builder';
import type {PredefinedStore} from 'bat-core/multistore';

import {App} from '../App';
import {MaintenancePage} from '../pages/MaintenancePage';

const {PUBLIC_URL} = process.env;

// Apollo Client GraphQL API endpoint
const {LUFT_APP_DATA_URI} = process.env;

// Functionality enablement flags
const {
    LUFT_APP_MULTISTORES,
    LUFT_APP_CACHE_WARMER,
    LUFT_APP_CMS_CONTENT_BLOCKS,
    LUFT_APP_CMS_CONTENT_PAGES,
    LUFT_APP_PUSH_NOTIFICATIONS,
    LUFT_APP_COOKIE_NOTICE
} = process.env;

// Push notifications configuration variables
const {
    LUFT_APP_FIREBASE_API_KEY,
    LUFT_APP_FIREBASE_AUTH_DOMAIN,
    LUFT_APP_FIREBASE_DATABASE_URL,
    LUFT_APP_FIREBASE_PROJECT_ID,
    LUFT_APP_FIREBASE_STORAGE_BUCKET,
    LUFT_APP_FIREBASE_MESSAGING_SENDER_ID,
    LUFT_APP_FIREBASE_APP_ID,
    LUFT_APP_FIREBASE_MEASUREMENT_ID,
    LUFT_APP_WEBSITE_SERVICE_URL,
    LUFT_APP_WEBSITE_PUSH_ID
} = process.env;

// defines which component should be used for CMS pages and CMS blocks. Can be M2, SFCC or empty
const {
    LUFT_APP_CMS_RENDERER
} = process.env;

const CMS_RENDERERS = {
    M2: PageBuilderComponent
};

const FRACTION_DIGITS = {
    ph: 2,
    id: 0
};

type Props = {
    /**
     * Application start url. Used in static router for ssr.
     */
    url?: string,
    /**
     * Apollo HTTP link uri. Used in ssr mode.
     */
    dataUri?: string,
    /**
     * if App should work in ssr mode.
     */
    ssr?: boolean,
    /**
     * Custom fetch instance for Apollo
     */
    fetch?: Object,
    /**
     * List of predefined stores
     */
    stores?: PredefinedStore[]
};

export function FullApp({
    url,
    dataUri = LUFT_APP_DATA_URI,
    ssr,
    fetch,
    stores
}: Props) {
    const {isSMdown} = useResolutions();
    const authLink = useAuthLink();
    const internalServerErrorLink = useInternalServerErrorLink();
    const isMaintenanceMode = useIsInternalServerError();

    const storeCode = getStoreCodeByPathname();
    const paynamicsOrderMethodsRenderer = getPaynamicsMethodsRenderer('order');
    const paynamicsMethodListRenderer = getPaynamicsMethodsRenderer('method');
    const paynamicsMethodDetailsRenderer = getPaynamicsMethodsRenderer('details');

    const messages = (locale) => {
        switch (locale) {
            case 'id-ID':
                // `micro` messages should override the same messages from full list,
                // because their translations could be different for different markets
                // with the same language
                return getMergedTranslationMessages([
                    import('../translations/id.json'),
                    import('../translations/micro-id.json')
                ]);

            default:
                if (storeCode === 'ph') return import('../translations/micro-ph.json');
        }
    };

    const config = {
        ssr,
        url,
        fetch,
        dataUri,
        serviceWorker: {
            swSrc: `${PUBLIC_URL}/service-worker.js`
        },
        pushNotifications: {
            enabled: LUFT_APP_PUSH_NOTIFICATIONS,
            firebaseConfig: {
                apiKey: LUFT_APP_FIREBASE_API_KEY,
                authDomain: LUFT_APP_FIREBASE_AUTH_DOMAIN,
                databaseURL: LUFT_APP_FIREBASE_DATABASE_URL,
                projectId: LUFT_APP_FIREBASE_PROJECT_ID,
                storageBucket: LUFT_APP_FIREBASE_STORAGE_BUCKET,
                messagingSenderId: LUFT_APP_FIREBASE_MESSAGING_SENDER_ID,
                appId: LUFT_APP_FIREBASE_APP_ID,
                measurementId: LUFT_APP_FIREBASE_MEASUREMENT_ID
            },
            apnConfig: {
                webServiceUrl: LUFT_APP_WEBSITE_SERVICE_URL,
                websitePushId: LUFT_APP_WEBSITE_PUSH_ID
            }
        },
        payments: {
            renderers: new Map([
                [
                    'espay',
                    props => (
                        <EspayRendererContainer {...props}
                                                shouldValidateKtp={false}/>
                    )
                ],
                ...paynamicsOrderMethodsRenderer
            ]),
            methodRenderers: new Map([...paynamicsMethodListRenderer]),
            methodDetailsRenderers: new Map([...paynamicsMethodDetailsRenderer])
        },
        cms: {
            enableBlocks: LUFT_APP_CMS_CONTENT_BLOCKS,
            enablePages: LUFT_APP_CMS_CONTENT_PAGES,
            renderer: CMS_RENDERERS[LUFT_APP_CMS_RENDERER]
        },
        stores: {
            enabled: LUFT_APP_MULTISTORES,
            predefinedStores: stores,
            links: [
                internalServerErrorLink,
                new PersistedQueryLink({useGETForHashedQueries: true})
            ]
        },
        router: {
            shouldScrollTop: location => isSMdown || !location.pathname.startsWith('/checkout')
        },
        apollo: {
            links: [
                internalServerErrorLink,
                authLink,
                cartErrorLink,
                new PersistedQueryLink({useGETForHashedQueries: true})
            ]
        },
        intl: {
            messages,
            formats: {
                number: {
                    money: {
                        minimumFractionDigits: FRACTION_DIGITS[storeCode],
                        maximumFractionDigits: FRACTION_DIGITS[storeCode]
                    }
                }
            }
        },
        cacheWarmer: {
            enabled: LUFT_APP_CACHE_WARMER
        },
        productRenderers: {
            ProductPreviewComponent: ProductPreviewAltComponent,
            ProductPaneComponent
        },
        cart: {
            renderers: new Map([
                ['CartItemContainer', CartItemContainer]
            ])
        }
    };

    return (
        <LuftBootComponent config={config}>
            {isMaintenanceMode ? (
                <MaintenancePage/>
            ) : (
                <MenuProviderComponent>
                    <MiniCartProviderComponent>
                        <StoreConfigContainer as={App}
                                              showCookieNotice={LUFT_APP_COOKIE_NOTICE}
                                              loadingAs={() => <LoaderComponent type="fixed"/>}/>
                    </MiniCartProviderComponent>
                </MenuProviderComponent>
            )}
        </LuftBootComponent>
    );
}
