// src/app/services/notifications/notifications.service.ts
import { Injectable, signal } from '@angular/core';

export interface IncomingOrder {
  id: string;
  description: string;
  amount: number;
  status: string;
  created_at?: string;
}

type OrderId = string;

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly NOTIF_URL = 'http://127.0.0.1:8080/api/notifications/stream';
  private readonly STORAGE_KEY = 'orderStatesAngular'; // ✅ evita colisión con React

  // 🧠 Estado reactivo
  unreadCount = signal(0);
  highlighted = signal<Set<OrderId>>(new Set());
  read = signal<Set<OrderId>>(new Set());

  private es: EventSource | null = null;

  constructor() {
    // Cargar estado desde localStorage
    const { highlighted, read } = this.loadOrderStates();
    this.highlighted.set(highlighted);
    this.read.set(read);
    this.unreadCount.set(highlighted.size);

    this.start();
  }

  /** 🌊 Suscripción SSE */
  start() {
    if (this.es) {
      this.es.close();
      this.es = null;
    }

    const es = new EventSource(this.NOTIF_URL);
    this.es = es;

    es.addEventListener('notification', (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data);
        const order = this.parseOrderFromMessage(data?.message ?? '');
        if (!order) return;

        // Resalta si no está leída
        const readSet = this.read();
        const highlighted = new Set(this.highlighted());
        if (!readSet.has(order.id)) {
          highlighted.add(order.id);
          this.highlighted.set(highlighted);
          this.unreadCount.set(highlighted.size);
          this.persistState();
        }

        // Notificar a la UI (listado) para insertar la fila
        const event = new CustomEvent<IncomingOrder>('order-created', { detail: order });
        window.dispatchEvent(event);
      } catch (err) {
        console.error('Error procesando SSE:', err);
      }
    });

    es.onerror = (err) => {
      console.error('Error en EventSource:', err);
      setTimeout(() => this.start(), 3000);
    };
  }

  /** ✅ Marca una orden como leída (quita resaltado y baja contador) */
  markAsRead(orderId: string) {
    const highlighted = new Set(this.highlighted());
    const read = new Set(this.read());

    highlighted.delete(orderId);
    read.add(orderId);

    this.highlighted.set(highlighted);
    this.read.set(read);
    this.unreadCount.set(highlighted.size);
    this.persistState();
  }

  /** Marcar todas como leídas (campanita a 0) */
  markAllAsRead() {
    const read = new Set([...this.read(), ...this.highlighted()]);
    this.highlighted.set(new Set());
    this.read.set(read);
    this.unreadCount.set(0);
    this.persistState();
  }

  /** 🧩 Parsear notificación de texto a objeto orden */
  private parseOrderFromMessage(message: string): IncomingOrder | null {
    // "Nueva orden disponible...\nID: <uuid>\nDescripción: <text>\nMonto: $<amount>\nEstado: <status>"
    try {
      const idMatch = message.match(/ID:\s*([A-Za-z0-9-]+)/i);
      const descMatch = message.match(/Descripción:\s*(.+)\n/i);
      const amountMatch = message.match(/Monto:\s*\$?\s*([0-9]+(?:\.[0-9]+)?)/i);
      const statusMatch = message.match(/Estado:\s*([A-Z_]+)/i);

      const id = idMatch?.[1] ?? '';
      const description = (descMatch?.[1] ?? '').trim();
      const amount = parseFloat(amountMatch?.[1] ?? '0');
      const status = statusMatch?.[1] ?? 'PENDING';

      if (!id) return null;
      return { id, description, amount, status };
    } catch {
      return null;
    }
  }

  /** 💾 Persistir estado */
  private persistState() {
    localStorage.setItem(
      this.STORAGE_KEY,
      JSON.stringify({
        highlighted: Array.from(this.highlighted()),
        read: Array.from(this.read()),
      })
    );
  }

  /** 💾 Carga inicial */
  private loadOrderStates(): { highlighted: Set<string>; read: Set<string> } {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return { highlighted: new Set(), read: new Set() };
      const parsed = JSON.parse(raw);
      return {
        highlighted: new Set(parsed.highlighted || []),
        read: new Set(parsed.read || []),
      };
    } catch {
      return { highlighted: new Set(), read: new Set() };
    }
  }
}
