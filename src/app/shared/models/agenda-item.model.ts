export interface IAgendaItem {
    _id?: string;
    id?: string;
    topic: string;
    durationInMinutes: number;
    order: number;
    status: "pending" | "active" | "completed";
    actualStartTime?: Date | string;
    agenda_id?: string;
    presenter_id?: string;
}