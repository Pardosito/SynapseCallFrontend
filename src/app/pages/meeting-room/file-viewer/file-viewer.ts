import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-file-viewer',
  standalone: true,
  imports: [],
  templateUrl: './file-viewer.html',
  styleUrl: './file-viewer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileViewer {
  closePanel = output<void>();
}
