import loadable from '@loadable/component';

export const StoreLocatorPage = loadable(() => import('./StoreLocatorPage'), {
    resolveComponent: module => module.StoreLocatorPage
});
