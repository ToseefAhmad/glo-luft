import loadable from '@loadable/component';

export const CheckoutPage = loadable(() => import('./CheckoutPage'), {
    resolveComponent: module => module.CheckoutPage
});
