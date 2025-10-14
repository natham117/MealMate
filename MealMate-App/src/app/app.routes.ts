import { Routes } from '@angular/router';

import { Login } from './auth/login/login';
import { Register } from './auth/register/register';

import { Recipes } from './pages/recipes/recipes';
import { ShoppingList } from './pages/shopping-list/shopping-list';
import { Settings } from './pages/settings/settings';
import { Home } from './pages/home/home';
import { ShoppingListOverview } from './pages/shopping-list-overview/shopping-list-overview';

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
        path : 'settings',
        component: Settings
    },
    {
        path : 'shopping-list-overview',
        component: ShoppingListOverview
    }

];
