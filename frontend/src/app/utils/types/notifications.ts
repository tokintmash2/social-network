export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  type: 'follow' | 'group' | 'comment' | 'friend_request' | 'group_request' | 'event_request' | 'group_member_added';
  linkTo: string;
  read: boolean;
  extra?: string;
  requestType?: 'friend' | 'group' | 'event';
  status?: 'pending' | 'accepted' | 'declined';
}
