import loadable from '@loadable/component';

export const NoMatchPage = loadable(() => import('./NoMatchPage'), {
    resolveComponent: module => module.NoMatchPage
});
