import loadable from '@loadable/component';

export const BlogPostPage = loadable(() => import('./BlogPostPage'), {
    resolveComponent: module => module.BlogPostPage
});
