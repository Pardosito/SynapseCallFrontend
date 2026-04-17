import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  imports: [FormsModule],
  templateUrl: './login-form.html',
  styleUrl: './login-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginForm {
  readonly email = model('');
  readonly password = model('');
  readonly disabled = input(false);
  readonly isLoading = input(false);
  readonly errorMessage = input('');
  readonly submitLogin = output<void>();

  protected submit(): void {
    this.submitLogin.emit();
  }
}
