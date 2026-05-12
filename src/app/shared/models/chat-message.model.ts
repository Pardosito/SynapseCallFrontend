import { FileEntry } from '../../services/meeting-files.service';

export interface ChatMessage {
  userName:   string;
  message:    string;
  sentAt:     string;
  socketId:   string;
  fileEntry?: FileEntry;
}
