
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
  monadId: string; // For Monad blockchain integration
  onChainMetadata?: {
    creator: string;
    creationBlock: number;
    evolutionStage: number;
    battleHistory: number[];
  };
}

export interface Player {
  id: string;
  username: string;
  monadAddress: string; // Monad wallet address
  avatar: string;
  level: number;
  experience: number;
  wins: number;
  losses: number;
  cards: Card[];
  monad: number; // MONAD tokens balance
  transactionHistory?: {
    txHash: string;
    type: 'BATTLE' | 'TRADE' | 'MINT' | 'EVOLVE';
    timestamp: number;
    details: string;
  }[];
}

export interface MarketListing {
  id: string;
  card: Card;
  price: number;
  seller: string;
  timestamp: number;
  monadContract: string; // Monad smart contract address
  monadTxHash?: string; // Transaction hash on Monad blockchain
}

export interface GameState {
  isOnChain: boolean;
  currentBlockHeight?: number;
  lastSyncedBlock?: number;
  pendingTransactions: number;
  networkStatus: 'connected' | 'syncing' | 'disconnected';
}

// Monad-specific interfaces
export interface MonadTransaction {
  txHash: string;
  fromAddress: string;
  toAddress: string;
  amount: number;
  timestamp: number;
  blockHeight: number;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'transfer' | 'mint' | 'battle' | 'trade';
}

export interface MonadGameMove {
  moveId: string;
  playerAddress: string;
  cardId: string;
  moveType: 'attack' | 'defend' | 'special';
  timestamp: number;
  onChainSignature?: string;
  verified: boolean;
}
