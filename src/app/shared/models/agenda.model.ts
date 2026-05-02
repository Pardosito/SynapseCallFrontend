import { IAgendaItem } from './agenda-item.model';

export interface IAgenda {
    id?: string;
    currentItemIndex: number;
    isAutoAdvanceEnabled: boolean;
    meeting_id: string;
    items?: IAgendaItem[];
}