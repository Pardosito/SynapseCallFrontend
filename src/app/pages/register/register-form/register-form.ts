import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register-form',
  imports: [FormsModule],
  templateUrl: './register-form.html',
  styleUrl: './register-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterForm {
  readonly name = model('');
  readonly email = model('');
  readonly password = model('');
  readonly confirmPassword = model('');
  readonly disabled = input(false);
  readonly isLoading = input(false);
  readonly errorMessage = input('');
  readonly submitRegister = output<void>();

  protected submit(): void {
    this.submitRegister.emit();
  }
}
