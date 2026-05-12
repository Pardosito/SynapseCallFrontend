import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface FileEntry {
  key: string;
  url: string;
  originalName?: string;
}

@Injectable({ providedIn: 'root' })
export class MeetingFilesService {
  private http = inject(HttpClient);

  upload(meetingId: string, file: File): Observable<{ file: FileEntry }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ file: FileEntry }>(
      `${environment.apiUrl}/meetings/${meetingId}/uploadFiles`,
      formData,
    );
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
}
