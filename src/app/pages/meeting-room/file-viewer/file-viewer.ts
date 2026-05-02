import {
  ChangeDetectionStrategy, Component, OnDestroy, OnInit,
  effect, inject, input, output, signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { SignalingService } from '../../../services/signaling.service';
import { environment } from '../../../../environments/environment.development';

export interface FileEntry {
  key: string;
  url: string;
  originalName?: string;
}

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
  private http             = inject(HttpClient);

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
    this.upload(file);
  }

  private upload(file: File): void {
    const formData = new FormData();
    formData.append('file', file);
    this.isUploading.set(true);
    this.http
      .post<any>(`${environment.apiUrl}/meetings/${this.meetingId()}/uploadFiles`, formData)
      .subscribe({
        next:  () => this.isUploading.set(false),
        error: () => this.isUploading.set(false),
      });
  }

  displayName(entry: FileEntry): string {
    if (entry.originalName) return entry.originalName;
    const parts = entry.key.split('---');
    return decodeURIComponent(parts[parts.length - 1]).replace(/_/g, ' ');
  }

  fileIcon(entry: FileEntry): 'image' | 'pdf' | 'archive' | 'doc' {
    const ext = this.displayName(entry).split('.').pop()?.toLowerCase() ?? '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['zip', 'rar'].includes(ext)) return 'archive';
    return 'doc';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
