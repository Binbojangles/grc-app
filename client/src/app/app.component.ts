import { Component } from '@angular/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public authService: AuthService) {}

  // We'll get the admin status directly from the template
  // using authService.currentUser?.role === 'admin'

  /**
   * Updates the UI styles by triggering a page refresh
   * which will re-fetch the latest styles
   */
  updateStyles() {
    // Simply reload the page to get the latest styles
    window.location.reload();
  }
}
