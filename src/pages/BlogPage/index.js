import loadable from '@loadable/component';

export const BlogPage = loadable(() => import('./BlogPage'), {
    resolveComponent: module => module.BlogPage
});
