/* eslint  no-restricted-globals: off */
import {clientsClaim, skipWaiting} from 'workbox-core';
import {registerFirebaseNotification} from '@luft/push-notification/src/service-worker';
import {
    registerImageRoute,
    registerPrecacheRoute
} from '@luft/service-worker/src/service-worker';

import {registerNavigationRoute} from 'bat-core/service-worker/src/service-worker';

// kick out the current active worker and activate itself as soon as it enters the waiting phase
skipWaiting();
// allows current service worker to set itself as the controller for all clients within its scope
clientsClaim();

self.__WB_DISABLE_DEV_LOGS = true;

if (process.env.NODE_ENV !== 'development') {
    // allows to precache static files compiled by webpack
    registerPrecacheRoute();
    // allows to navigate all page requests to index.html
    registerNavigationRoute();
}

// allows to cache all the images from home or remote urls
registerImageRoute();

if (process.env.LUFT_APP_PUSH_NOTIFICATIONS) {
    // push notification
    registerFirebaseNotification({
        apiKey: process.env.LUFT_APP_FIREBASE_API_KEY,
        authDomain: process.env.LUFT_APP_FIREBASE_AUTH_DOMAIN,
        databaseURL: process.env.LUFT_APP_FIREBASE_DATABASE_URL,
        projectId: process.env.LUFT_APP_FIREBASE_PROJECT_ID,
        storageBucket: process.env.LUFT_APP_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.LUFT_APP_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.LUFT_APP_FIREBASE_APP_ID,
        measurementId: process.env.LUFT_APP_FIREBASE_MEASUREMENT_ID
    });
}
