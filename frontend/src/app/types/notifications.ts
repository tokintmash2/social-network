export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  type: 'follow' | 'group' | 'comment';
  linkTo: string;
  read: boolean;
}
