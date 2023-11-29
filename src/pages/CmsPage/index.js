import loadable from '@loadable/component';

export const CmsPage = loadable(() => import('./CmsPage'), {
    resolveComponent: module => module.CmsPage
});
