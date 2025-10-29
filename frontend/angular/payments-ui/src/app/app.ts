// src/app/app.ts
import { Component, computed, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificationsService } from './services/notifications/notifications.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, MatBadgeModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App {
  private notif = inject(NotificationsService);

  // ✅ computed para que se actualice en tiempo real
  notificationsCount = computed(() => this.notif.unreadCount());

  markAllRead() {
    this.notif.markAllAsRead();
  }
}
