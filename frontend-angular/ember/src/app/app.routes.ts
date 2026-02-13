import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('../content/home/home').then(m => m.HomeComponent) },
    { path: 'management', loadComponent: () => import('../content/management/management').then(m => m.ManagementComponent) },
];
