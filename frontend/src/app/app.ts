import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppShellComponent } from './components/app-shell/app-shell';
import { ThemeService } from './theme.service';

@Component({
  imports: [AppShellComponent, RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly themeService = inject(ThemeService);

  constructor() {
    this.themeService.applySavedOrSystemTheme();
  }
}
