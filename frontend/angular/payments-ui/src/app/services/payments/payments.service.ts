// src/app/services/payments/payments.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of } from 'rxjs';

export interface PaymentRequest {
  orderId: string;
  amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private readonly baseUrl = 'http://localhost:3000/api/payments';

  loading = signal(false);

  constructor(private http: HttpClient) {}

  createPayment(payload: PaymentRequest) {
    return this.http.post<any>(this.baseUrl, payload).pipe(
      map((res) => res.data),
      catchError((err) => {
        console.error('Error creating payment:', err);
        return of(null);
      })
    );
  }
}
