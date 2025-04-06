
export enum CardRarity {
  COMMON = "common",
  RARE = "rare",
  EPIC = "epic",
  LEGENDARY = "legendary"
}

export enum CardType {
  ATTACK = "attack",
  DEFENSE = "defense",
  UTILITY = "utility"
}

export interface Card {
  id: string;
  name: string;
  description: string;
  image: string;
  rarity: CardRarity;
  type: CardType;
  attack?: number;
  defense?: number;
  mana: number;
  tokenId?: string; // For blockchain integration
}

export interface Player {
  id: string;
  username: string;
  address?: string; // Wallet address
  avatar: string;
  level: number;
  experience: number;
  wins: number;
  losses: number;
  cards: Card[];
  tokens: number;
}

export interface MarketListing {
  id: string;
  card: Card;
  price: number;
  seller: string;
  timestamp: number;
}
