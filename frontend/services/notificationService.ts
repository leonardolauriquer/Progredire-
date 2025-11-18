import { ActiveView } from '../App';
import { initialCampaigns } from '../components/dashboardMockData';

const NOTIFICATIONS_KEY = 'progredire-notifications';

export interface Notification {
  id: number;
  message: string;
  timestamp: string;
  read: boolean;
  link?: {
    view: ActiveView;
    context?: any;
  };
  sourceId?: string; // e.g., 'campaign-2' to prevent duplicates
}

const getNotifications = (): Notification[] => {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get notifications', error);
    return [];
  }
};

const saveNotifications = (notifications: Notification[]): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications', error);
  }
};

// Main function to be called by the app
export const generateAndFetchNotifications = (): Notification[] => {
  let notifications = getNotifications();
  const existingSourceIds = new Set(notifications.map(n => n.sourceId).filter(Boolean));

  // 1. Welcome Notification for first-time user
  if (notifications.length === 0) {
    notifications.push({
      id: Date.now(),
      message: 'Bem-vindo(a) ao Progredire+! Explore as funcionalidades para impulsionar o bem-estar na sua organização.',
      timestamp: new Date().toISOString(),
      read: false,
      sourceId: 'welcome-1',
    });
  }

  // 2. Check for completed campaigns
  initialCampaigns.forEach(campaign => {
    const sourceId = `campaign-finished-${campaign.id}`;
    const endDate = new Date(campaign.endDate);
    const today = new Date();

    if (campaign.status === 'Concluída' && endDate < today && !existingSourceIds.has(sourceId)) {
      notifications.unshift({ // Add to the top
        id: Date.now() + campaign.id,
        message: `A campanha "${campaign.name}" foi concluída. Os resultados já estão disponíveis no dashboard.`,
        timestamp: new Date(endDate.setDate(endDate.getDate() + 1)).toISOString(), // 1 day after it ended
        read: false,
        link: {
          view: 'dashboard',
          context: campaign.filters,
        },
        sourceId: sourceId,
      });
    }
  });
  
  // 3. (Future) Check for overdue action plans - This requires a bit more logic and access to action plan data.
  // For now, I'll skip this to keep the implementation focused.

  notifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  saveNotifications(notifications);
  return notifications;
};

export const markAllAsRead = (): Notification[] => {
  const notifications = getNotifications();
  const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
  saveNotifications(updatedNotifications);
  return updatedNotifications;
};
