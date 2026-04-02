export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: Category[];
  items?: Item[];
  phrases?: Phrase[];
  special?: 'pain-scale' | 'body-parts' | 'time';
}

export interface Item {
  id: string;
  text: string;
  icon: string;
}

export interface Phrase {
  id: string;
  text: string;
  icon: string;
}

export interface RecentItem {
  text: string;
  icon: string;
  tappedAt: Date;
}

export interface QuickName {
  id: string;
  name: string;
  icon: string;
  position: number;
}
