// src/app/pages/order-detail/order-detail.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { OrdersService, Order } from '../../services/orders/orders.service';
import { PaymentsService } from '../../services/payments/payments.service';
import { NotificationsService } from '../../services/notifications/notifications.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
})
export class OrderDetailComponent {
  private route = inject(ActivatedRoute);
  private ordersService = inject(OrdersService);
  private paymentsService = inject(PaymentsService);
  private snackBar = inject(MatSnackBar);
  private notifService = inject(NotificationsService); // ✅ para markAsRead

  order = signal<Order | null>(null);
  isLoading = signal(true);
  isPaying = signal(false);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    } else {
      this.isLoading.set(false);
      this.snackBar.open('No se encontró el ID de la orden.', 'Cerrar', { duration: 3000 });
    }
  }

  /** 🔹 Carga la orden desde el backend Django */
  private loadOrder(id: string) {
    this.isLoading.set(true);
    this.ordersService.getOrderById(id).subscribe({
      next: (res) => {
        this.order.set(res.data);
        this.isLoading.set(false);

        // ✅ marcar como leída al abrir el detalle
        this.notifService.markAsRead(id);
      },
      error: (err) => {
        console.error('Error cargando orden:', err);
        this.isLoading.set(false);
        this.snackBar.open('Error al cargar la orden ❌', 'Cerrar', { duration: 3000 });
      },
    });
  }

  /** 💳 Procesa el pago de la orden */
  payOrder() {
    const order = this.order();
    if (!order || this.isPaying()) return;

    this.isPaying.set(true);

    this.paymentsService
      .createPayment({ orderId: order.id, amount: parseFloat(order.amount) })
      .subscribe({
        next: () => {
          this.snackBar.open('Pago realizado exitosamente ✅', 'Cerrar', { duration: 3000 });
          this.order.update((o) => (o ? { ...o, status: 'PAID' } : o));
        },
        error: (err) => {
          console.error('Error procesando pago:', err);
          this.snackBar.open('Error al procesar el pago ❌', 'Cerrar', { duration: 3000 });
        },
        complete: () => {
          this.isPaying.set(false);
        },
      });
  }
}
