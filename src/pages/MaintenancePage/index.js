import loadable from '@loadable/component';

export const MaintenancePage = loadable(() => import('./MaintenancePage'), {
    resolveComponent: module => module.MaintenancePage
});
