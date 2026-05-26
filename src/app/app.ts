import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DsToastContainerComponent } from '@shared/design-system';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DsToastContainerComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App { }
