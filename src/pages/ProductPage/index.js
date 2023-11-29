import loadable from '@loadable/component';

export const ProductPage = loadable(() => import('./ProductPage'), {
    resolveComponent: module => module.ProductPage
});
