import loadable from '@loadable/component';

export const CartPage = loadable(() => import('./CartPage'), {
    resolveComponent: module => module.CartPage
});
