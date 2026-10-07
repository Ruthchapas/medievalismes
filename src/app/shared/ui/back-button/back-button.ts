import { Component } from '@angular/core';

/** Usage: <a appBackButton routerLink="/mapa" aria-label="Torna al mapa"></a> */
@Component({
  selector: 'a[appBackButton]',
  imports: [],
  templateUrl: './back-button.html',
  styleUrl: './back-button.scss',
})
export class BackButton {}
