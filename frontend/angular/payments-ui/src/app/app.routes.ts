// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { OrdersListComponent } from '../app/pages/order-list/orders-list.component';
import { OrderDetailComponent } from '../app/pages/order-detail/order-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'orders', pathMatch: 'full' },
  { path: 'orders', component: OrdersListComponent },
  { path: 'orders/:id', component: OrderDetailComponent },
];
