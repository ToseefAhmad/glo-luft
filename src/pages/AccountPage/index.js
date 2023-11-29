import loadable from '@loadable/component';

export const AccountPage = loadable(() => import('./AccountPage'), {
    resolveComponent: module => module.AccountPage
});
