import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingSpinnerComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Nova Capital';
  isOffline = false;
  hasUpdate = false;

  constructor(private swUpdate: SwUpdate) {}

  ngOnInit() {
    // Escuchar actualizaciones del Service Worker
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      ).subscribe(() => {
        this.hasUpdate = true;
      });
    }

    // Inicializar estado de red
    this.isOffline = !navigator.onLine;
  }

  // Escuchar si pierde internet
  @HostListener('window:offline', ['$event'])
  onOffline() {
    this.isOffline = true;
  }

  // Escuchar si recupera internet
  @HostListener('window:online', ['$event'])
  onOnline() {
    this.isOffline = false;
  }

  // Forzar actualización recargando la página
  reloadApp() {
    window.location.reload();
  }
}
