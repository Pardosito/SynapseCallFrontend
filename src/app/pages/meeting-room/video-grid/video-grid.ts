import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild, signal } from '@angular/core';

@Component({
  selector: 'app-video-grid',
  standalone: true,
  templateUrl: './video-grid.html',
  styleUrl: './video-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGrid implements OnInit {
  @ViewChild('myVideoElement', { static: true }) myVideo!: ElementRef<HTMLVideoElement>;

  myStream = signal<MediaStream | null>(null);

  ngOnInit(): void {
    this.startMyVideo();
  }

  async startMyVideo() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      this.myStream.set(stream);

      if (this.myVideo && this.myVideo.nativeElement) {
        this.myVideo.nativeElement.srcObject = stream;
      }

    } catch (error) {
      console.error('Error al acceder a la cámara/micrófono:', error);
    }
  }
}