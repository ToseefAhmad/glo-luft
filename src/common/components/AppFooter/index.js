import loadable from '@loadable/component';

export const AppFooter = loadable(() => import('./AppFooter'), {
    resolveComponent: module => module.AppFooter
});
