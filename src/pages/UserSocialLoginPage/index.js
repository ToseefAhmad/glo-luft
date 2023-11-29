import loadable from '@loadable/component';

export const UserSocialLoginPage = loadable(() => import('./UserSocialLoginPage'), {
    resolveComponent: module => module.UserSocialLoginPage
});
