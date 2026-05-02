import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-join-meeting-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-join-meeting-input.html',
  styleUrl: './create-join-meeting-input.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateJoinMeetingInput {
  private router = inject(Router);

  readonly createMeeting = output<void>();

  joinId = '';

  joinMeeting(): void {
    const id = this.joinId.trim();
    if (id) {
      this.router.navigate(['/room', id]);
    }
  }
}
