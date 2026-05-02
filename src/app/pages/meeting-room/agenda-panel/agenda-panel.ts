import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgendaService } from '../../../services/agenda.service';
import { SignalingService } from '../../../services/signaling.service';
import { IAgendaItem } from '../../../shared/models/agenda-item.model';
import { IAgenda } from '../../../shared/models/agenda.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-agenda-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './agenda-panel.html',
  styleUrl: './agenda-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaPanel implements OnInit, OnDestroy {
  meetingId = input.required<string>();
  isHost = input<boolean>(false);
  closePanel = output<void>();

  private agendaService = inject(AgendaService);
  private signalingService = inject(SignalingService);
  private cdr = inject(ChangeDetectorRef);

  agenda = signal<IAgenda | null>(null);
  items = signal<IAgendaItem[]>([]);
  activeItem = signal<IAgendaItem | null>(null);
  isFinished = signal(false);

  timeRemaining = signal<number>(0);
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  showAddForm = signal(false);
  newTopic = '';
  newDuration = 5;
  isAdding = signal(false);

  private subs: Subscription[] = [];

  ngOnInit(): void {
    this.loadAgenda();
    this.subscribeToSocketEvents();
  }

  loadAgenda(): void {
    this.agendaService.getAgendaByMeetingId(this.meetingId()).subscribe({
      next: (data) => {
        if (data.agenda) this.agenda.set(data.agenda);
        this.items.set(data.items ?? []);
        const active = data.items?.find(i => i.status === 'active') ?? null;
        this.activeItem.set(active);
        if (active) this.startTimer(active);
      }
    });
  }

  subscribeToSocketEvents(): void {
    this.subs.push(
      this.signalingService.onAgendaUpdate().subscribe(data => {
        this.activeItem.set(data.currentItem);
        this.isFinished.set(false);
        this.items.update(list =>
          list.map(i => this.itemId(i) === this.itemId(data.currentItem) ? data.currentItem : i)
        );
        this.startTimer(data.currentItem);
      }),

      this.signalingService.onAgendaFinished().subscribe(() => {
        this.activeItem.set(null);
        this.isFinished.set(true);
        this.stopTimer();
        this.loadAgenda();
      }),

      this.signalingService.onAgendaStopped().subscribe(() => {
        this.activeItem.set(null);
        this.stopTimer();
        this.loadAgenda();
      }),

      this.signalingService.onAgendaItemAdded().subscribe(item => {
        this.items.update(list => {
          if (list.find(i => this.itemId(i) === this.itemId(item))) return list;
          return [...list, item];
        });
      }),

      this.signalingService.onAgendaItemDeleted().subscribe(itemId => {
        this.items.update(list => list.filter(i => this.itemId(i) !== itemId));
        if (this.itemId(this.activeItem()!) === itemId) {
          this.activeItem.set(null);
          this.stopTimer();
        }
      }),
    );
  }

  startTimer(item: IAgendaItem): void {
    this.stopTimer();
    const startMs = item.actualStartTime
      ? new Date(item.actualStartTime).getTime()
      : Date.now();
    const endMs = startMs + item.durationInMinutes * 60 * 1000;

    const tick = () => {
      const remaining = Math.max(0, endMs - Date.now());
      this.timeRemaining.set(remaining);
      if (remaining === 0) this.stopTimer();
    };

    tick();
    this.timerInterval = setInterval(tick, 1000);
  }

  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  addItem(): void {
    if (!this.newTopic.trim() || this.isAdding()) return;
    this.isAdding.set(true);
    const order = this.items().length + 1;
    this.agendaService.addAgendaItem(this.meetingId(), {
      topic: this.newTopic.trim(),
      durationInMinutes: this.newDuration,
      order,
    }).subscribe({
      next: (item) => {
        this.items.update(list => [...list, item]);
        this.newTopic = '';
        this.newDuration = 5;
        this.showAddForm.set(false);
        this.isAdding.set(false);
      },
      error: () => this.isAdding.set(false),
    });
  }

  startAgenda(): void {
    const first = [...this.items()].sort((a, b) => a.order - b.order)
      .find(i => i.status === 'pending');
    const id = first ? this.itemId(first) : null;
    if (id) this.signalingService.emitAgendaStart(this.meetingId(), id);
  }

  nextItem(): void {
    const active = this.activeItem();
    if (!active) return;
    const sorted = [...this.items()].sort((a, b) => a.order - b.order);
    const idx = sorted.findIndex(i => this.itemId(i) === this.itemId(active));
    const next = sorted[idx + 1];
    this.signalingService.emitAgendaNext(
      this.itemId(active),
      next ? this.itemId(next) : ''
    );
  }

  stopAgenda(): void {
    const active = this.activeItem();
    if (active) this.signalingService.emitAgendaStop(this.itemId(active));
  }

  deleteItem(item: IAgendaItem): void {
    const id = this.itemId(item);
    if (!id || item.status === 'active') return;
    this.agendaService.deleteAgendaItem(id).subscribe({
      next: () => this.items.update(list => list.filter(i => this.itemId(i) !== id)),
    });
  }

  get formattedTime(): string {
    const ms = this.timeRemaining();
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  get timerClass(): string {
    const ms = this.timeRemaining();
    if (ms < 30000) return 'timer--danger';
    if (ms < 60000) return 'timer--warning';
    return '';
  }

  itemId(item: IAgendaItem): string {
    return item._id ?? item.id ?? '';
  }

  ngOnDestroy(): void {
    this.stopTimer();
    this.subs.forEach(s => s.unsubscribe());
  }
}
