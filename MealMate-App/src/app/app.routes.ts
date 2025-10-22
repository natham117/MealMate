import { Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { Register } from './auth/register/register';

import { Recipes } from './pages/recipes/recipes';
import { ShoppingList } from './pages/shopping-list/shopping-list';
import { Profile } from './pages/profile/profile';
import { Home } from './pages/home/home';


export const routes: Routes = [

    {
        path : '',
        redirectTo: 'app-home',
        pathMatch: 'full'
    },
    {
        path : 'app-home',
        component: Home
    },
    {
        path : 'login',
        component: Login
    },
    {
        path : 'register',
        component: Register
    },
    {
        path : 'recipes',
        component: Recipes
    },
    {
        path : 'shopping-list',
        component: ShoppingList
    },
    {
        path : 'profile',
        component: Profile
    },
    {
        path: 'confirm',
        loadComponent: () => import('./auth/confirm/confirm').then(m => m.Confirm)
    },
    {
        path: 'confirm-email-change',
        loadComponent: () => import('./auth/confirm/confirm').then(m => m.Confirm)
    }
];
