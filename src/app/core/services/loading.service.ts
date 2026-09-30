import { Injectable, signal } from '@angular/core';

export type LoadingType = 'bitcoin' | 'candles' | 'radar';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  
  public isOpen = signal<boolean>(false);
  public type = signal<LoadingType>('radar');
  public message = signal<string>('Cargando...');

  constructor() {}

  show(type: LoadingType = 'radar', message: string = 'Cargando...') {
    this.type.set(type);
    this.message.set(message);
    this.isOpen.set(true);
  }

  hide() {
    this.isOpen.set(false);
  }
}
