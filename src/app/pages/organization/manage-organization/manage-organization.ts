import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrganizationsService } from '../../../services/organizations.service';
import { IOrganization } from '../../../shared/models/org.model';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-manage-organization',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './manage-organization.html',
  styleUrl: './manage-organization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageOrganization {
  private readonly orgService = inject(OrganizationsService);

  organizationId = input.required<string>();
  isOwner = input<boolean>(false);

  orgData = signal<IOrganization | null>(null);
  isLoading = signal(true);
  inviteEmail = signal('');
  isInviting = signal(false);
  message = signal('');

  constructor() {
    // We can't use input value in constructor, so we load in effect or lifecycle
  }

  ngOnInit() {
    this.loadOrgDetails();
  }

  loadOrgDetails() {
    this.isLoading.set(true);
    this.orgService.getOrgById(this.organizationId()).subscribe({
      next: (res) => {
        this.orgData.set(res.organization);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onInviteMember() {
    const email = this.inviteEmail().trim();
    if (!email) return;

    this.isInviting.set(true);
    this.message.set('');
    
    this.orgService.addMemberToOrg(email, this.organizationId()).subscribe({
      next: () => {
        this.isInviting.set(false);
        this.inviteEmail.set('');
        this.message.set('Invitación enviada con éxito.');
        this.loadOrgDetails();
      },
      error: (err) => {
        this.isInviting.set(false);
        const errorMsg = err.error?.message || 'Error al invitar al miembro.';
        this.message.set(errorMsg);
      }
    });
  }
}
