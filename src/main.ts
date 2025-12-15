import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// Polyfill minimal URL.parse used by pdf.js when not available in the browser
// See: https://developer.mozilla.org/en-US/docs/Web/API/URL/parse_static
// pdf.js calls URL.parse(href, { baseURL }) and expects a URL or null.
if (typeof (URL as any).parse !== 'function') {
  (URL as any).parse = (href: string, options?: { baseURL?: string }) => {
    try {
      const base = options && options.baseURL ? options.baseURL : undefined;
      // The URL constructor will throw if href/base is invalid.
      return base ? new URL(href, base) : new URL(href);
    } catch {
      return null;
    }
  };
}

bootstrapApplication(AppComponent, appConfig).catch(err => console.error(err));
