import loadable from '@loadable/component';

export const FullApp = loadable(() => import('./FullApp'), {
    resolveComponent: module => module.FullApp
});
