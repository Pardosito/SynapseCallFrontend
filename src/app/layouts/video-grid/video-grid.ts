import { Component } from '@angular/core';
import { VideoBlock } from '../video-block/video-block';

@Component({
  selector: 'app-video-grid',
  imports: [VideoBlock],
  templateUrl: './video-grid.html',
  styleUrl: './video-grid.scss',
})
export class VideoGrid {}
