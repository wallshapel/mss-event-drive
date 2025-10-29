// src/app/pages/order-list/orders-list.component.ts
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { OrdersService } from '../../services/orders/orders.service';
import {
  NotificationsService,
  IncomingOrder,
} from '../../services/notifications/notifications.service';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './orders-list.component.html',
  styleUrls: ['./orders-list.component.css'],
})
export class OrdersListComponent implements OnInit, OnDestroy {
  orders = signal<IncomingOrder[]>([]);
  displayedColumns = ['description', 'amount', 'status', 'actions'];
  totalItems = signal(0);
  pageSize = signal(5);
  currentPage = signal(1);

  // ✅ Debe ser pública/protected para usarla en el template
  protected notifService: NotificationsService;

  private listener: ((event: Event) => void) | null = null;

  constructor(private ordersService: OrdersService, notifService: NotificationsService) {
    this.notifService = notifService;
  }

  ngOnInit() {
    this.loadOrders();

    // Escuchar nuevas órdenes
    this.listener = (event: Event) => {
      const customEvent = event as CustomEvent<IncomingOrder>;
      const newOrder = customEvent.detail;
      if (!newOrder) return;

      this.orders.update((prev = []) => [newOrder, ...prev]);
      this.totalItems.update((n) => (n ?? 0) + 1);
    };

    window.addEventListener('order-created', this.listener);
  }

  ngOnDestroy() {
    if (this.listener) {
      window.removeEventListener('order-created', this.listener);
    }
  }

  /** 🔹 Cargar órdenes paginadas */
  loadOrders(page: number = 1) {
    this.ordersService.getOrders(page, this.pageSize()).subscribe({
      next: (response) => {
        const data = response.data;

        // Convertir amount a number
        const parsedOrders: IncomingOrder[] = (data.results ?? []).map((o) => ({
          id: o.id,
          description: o.description,
          amount: parseFloat(o.amount),
          status: o.status,
          created_at: o.created_at,
        }));

        this.orders.set(parsedOrders);
        this.totalItems.set(data.total_items ?? 0);
        this.currentPage.set(data.page ?? page);
      },
      error: (err) => console.error('Error fetching orders:', err),
    });
  }

  /** 🔹 Cambiar de página en el paginador */
  onPageChange(event: PageEvent) {
    this.pageSize.set(event.pageSize);
    this.currentPage.set(event.pageIndex + 1);
    this.loadOrders(this.currentPage());
  }

  /** 🔹 (Opcional) marcar todas como leídas desde aquí si lo necesitas */
  markAllAsRead() {
    this.notifService.markAllAsRead();
  }
}
