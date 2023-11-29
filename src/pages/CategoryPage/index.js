import loadable from '@loadable/component';

export const CategoryPage = loadable(() => import('./CategoryPage'), {
    resolveComponent: module => module.CategoryPage
});
