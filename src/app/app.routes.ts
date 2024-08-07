import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: async () =>
            await import('./features/authentication/authentication.component')
    },
    {
        path: 'designer/:username',
        loadComponent: async () =>
            await import('./features/designer/designer.component')
    }
];
