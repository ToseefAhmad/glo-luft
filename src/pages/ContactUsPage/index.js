import loadable from '@loadable/component';

export const ContactUsPage = loadable(() => import('./ContactUsPage'), {
    resolveComponent: module => module.ContactUsPage
});
