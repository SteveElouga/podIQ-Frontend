import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors, withFetch } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeuix/themes/aura';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { firstValueFrom, catchError, of } from 'rxjs';
import {
  LUCIDE_ICONS, LucideIconProvider,
  Bell, Search, ChevronRight, ChevronDown, Plus, X,
  Check, ArrowRight, Box, Clock, GitBranch, Shield,
  Key, User, Users, Zap, TriangleAlert, Eye, EyeOff, Copy,
  Play, RefreshCw, ListFilter, Code, Layers, Settings,
  Download, Upload, Moon, Sun, SlidersHorizontal, Activity,
  Folder, Pause, Trash2, Link, ExternalLink, Terminal,
  Pencil, House, Mail, MessageSquare, Slack,
} from 'lucide-angular';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';

function initI18n(): Promise<unknown> {
  const translate = inject(TranslateService);
  const lang = (localStorage.getItem('podiq:lang') ?? 'fr') as 'fr' | 'en';
  return firstValueFrom(translate.use(lang).pipe(catchError(() => of({}))));
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor]), withFetch()),
    MessageService,
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.dark-mode',
          cssLayer: { name: 'primeng', order: 'theme, base, primeng' },
        },
      },
      ripple: true,
    }),
    provideTranslateService({ fallbackLang: 'fr' }),
    provideTranslateHttpLoader({ prefix: '/assets/i18n/', suffix: '.json', useHttpBackend: true }),
    provideAppInitializer(initI18n),
    {
      provide: LUCIDE_ICONS,
      multi: true,
      useValue: new LucideIconProvider({
        Bell, Search, ChevronRight, ChevronDown, Plus, X,
        Check, ArrowRight, Box, Clock, GitBranch, Shield,
        Key, User, Users, Zap, TriangleAlert, Eye, EyeOff, Copy,
        Play, RefreshCw, ListFilter, Code, Layers, Settings,
        Download, Upload, Moon, Sun, SlidersHorizontal, Activity,
        Folder, Pause, Trash2, Link, ExternalLink, Terminal,
        Pencil, House, Mail, MessageSquare, Slack,
      }),
    },
  ],
};
