import {
  ChangeDetectionStrategy, Component, OnDestroy, OnInit,
  effect, inject, input, output, signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SignalingService } from '../../../services/signaling.service';
import { MeetingFilesService, FileEntry } from '../../../services/meeting-files.service';

export type { FileEntry };

@Component({
  selector: 'app-file-viewer',
  standalone: true,
  imports: [],
  templateUrl: './file-viewer.html',
  styleUrl: './file-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileViewer implements OnInit, OnDestroy {
  meetingId    = input.required<string>();
  initialLinks = input<FileEntry[]>([]);
  closePanel   = output<void>();

  private signalingService = inject(SignalingService);
  private filesService     = inject(MeetingFilesService);

  files       = signal<FileEntry[]>([]);
  isUploading = signal(false);

  private sub: Subscription | null = null;

  constructor() {
    effect(() => {
      const links = this.initialLinks();
      if (links.length) this.files.set(links);
    });
  }

  ngOnInit(): void {
    this.sub = this.signalingService.onFileUploaded().subscribe(file => {
      this.files.update(list => {
        if (list.find(f => f.key === file.key)) return list;
        return [...list, file];
      });
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;
    input.value = '';
    this.isUploading.set(true);
    this.filesService.upload(this.meetingId(), file).subscribe({
      next:  () => this.isUploading.set(false),
      error: () => this.isUploading.set(false),
    });
  }

  displayName = (entry: FileEntry) => this.filesService.displayName(entry);
  fileIcon    = (entry: FileEntry) => this.filesService.fileIcon(entry);

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
