export interface User {
  name: string;
  avatar?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  cards?: {
    type: 'itinerary' | 'flight' | 'bus' | 'accommodation';
    data: any[];
  };
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface SavedPlan {
  id: string;
  conversationId: string;
  destination: string;
  days: number;
  itinerary: any;
  createdAt: number;
}

const STORAGE_KEYS = {
  USER: 'travel_planner_user',
  CONVERSATIONS: 'travel_planner_conversations',
  PLANS: 'travel_planner_plans',
};

export const getUser = (): User => {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : { name: 'Anish' };
};

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getConversations = (): Conversation[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
  return stored ? JSON.parse(stored) : [];
};

export const saveConversation = (conversation: Conversation): void => {
  const conversations = getConversations();
  const index = conversations.findIndex(c => c.id === conversation.id);
  
  if (index >= 0) {
    conversations[index] = conversation;
  } else {
    conversations.unshift(conversation);
  }
  
  localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
};

export const getPlans = (): SavedPlan[] => {
  const stored = localStorage.getItem(STORAGE_KEYS.PLANS);
  return stored ? JSON.parse(stored) : [];
};

export const savePlan = (plan: SavedPlan): void => {
  const plans = getPlans();
  plans.unshift(plan);
  localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(plans));
};
