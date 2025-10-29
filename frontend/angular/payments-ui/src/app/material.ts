// src/app/material.ts
import { importProvidersFrom } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

export const MATERIAL_IMPORTS = importProvidersFrom(
  MatButtonModule,
  MatCardModule,
  MatTableModule,
  MatPaginatorModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatToolbarModule,
  MatSnackBarModule
);
