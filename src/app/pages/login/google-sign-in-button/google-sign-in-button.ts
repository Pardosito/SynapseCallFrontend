import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';

type GoogleAccountsButtonOptions = {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  logo_alignment?: 'left' | 'center';
  width?: number;
};

type GoogleWindow = Window & {
  google?: {
    accounts?: {
      id?: {
        initialize: (options: {
          client_id: string;
          callback: (response: { credential?: string }) => void;
          context?: string;
          itp_support?: boolean;
        }) => void;

        renderButton: (element: HTMLElement, options: GoogleAccountsButtonOptions) => void;

        prompt: () => void;
      };
    };
  };
};

const GOOGLE_SCRIPT_ID = 'google-identity-services-script';
let googleScriptLoadPromise: Promise<void> | null = null;

function ensureGoogleIdentityScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google sign-in is only available in the browser'));
  }

  if ((window as GoogleWindow).google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptLoadPromise) {
    return googleScriptLoadPromise;
  }

  googleScriptLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('No se pudo cargar Google Identity Services')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
    document.head.appendChild(script);
  });

  return googleScriptLoadPromise;
}

@Component({
  selector: 'app-google-sign-in-button',
  imports: [],
  templateUrl: './google-sign-in-button.html',
  styleUrl: './google-sign-in-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleSignInButton implements AfterViewInit {
  protected readonly environment = environment;
  readonly disabled = input(false);
  readonly googleCredential = output<string>();
  protected readonly isReady = signal(false);
  protected readonly loadError = signal('');
  private readonly buttonHost = viewChild<ElementRef<HTMLElement>>('buttonHost');

  public async ngAfterViewInit(): Promise<void> {
    if (!this.environment.googleClientId) {
      return;
    }

    try {
      await ensureGoogleIdentityScript();
      this.renderGoogleButton();
    } catch (error) {
      this.loadError.set(error instanceof Error ? error.message : 'No se pudo cargar el acceso con Google');
    }
  }

  private renderGoogleButton(): void {
    const host = this.buttonHost()?.nativeElement;
    const googleId = (window as GoogleWindow).google?.accounts?.id;

    if (!host || !googleId || !this.environment.googleClientId) {
      return;
    }

    host.innerHTML = '';
    const buttonWidth = Math.max(Math.floor(host.getBoundingClientRect().width), 280);

    googleId.initialize({
      client_id: this.environment.googleClientId,
      callback: (response) => {
        if (response.credential) {
          this.googleCredential.emit(response.credential);
        }
      },
      context: 'use',
      itp_support: true
    });

    googleId.renderButton(host, {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      text: 'signin_with',
      logo_alignment: 'left',
      width: buttonWidth,
    });

    googleId.prompt();

    this.isReady.set(true);
  }
}
