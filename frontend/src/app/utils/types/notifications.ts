export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  type: 'follow' | 'group' | 'comment' | 'friend_request' | 'group_request' | 'event_request';
  linkTo: string;
  read: boolean;
  requestType?: 'friend' | 'group' | 'event';
  status?: 'pending' | 'accepted' | 'declined';
}
