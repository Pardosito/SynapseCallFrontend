import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-organization-form',
  imports: [FormsModule],
  templateUrl: './create-organization-form.html',
  styleUrl: './create-organization-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateOrganizationForm {
  readonly organizationName = model('');
  readonly disabled = input(false);
  readonly logoSelected = output<File | null>();

  protected onLogoChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    this.logoSelected.emit(file);
  }
}
