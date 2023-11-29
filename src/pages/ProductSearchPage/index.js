import loadable from '@loadable/component';

export const ProductSearchPage = loadable(() => import('./ProductSearchPage'), {
    resolveComponent: module => module.ProductSearchPage
});
