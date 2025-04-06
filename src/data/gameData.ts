
import { Card, CardRarity, CardType, MarketListing, Player } from "../types/game";

export const cards: Card[] = [
  {
    id: "card-1",
    name: "Lightning Strike",
    description: "Deal 5 damage to target player",
    image: "/lightning-strike.png",
    rarity: CardRarity.COMMON,
    type: CardType.ATTACK,
    attack: 5,
    mana: 2,
    tokenId: "0x1"
  },
  {
    id: "card-2",
    name: "Mystic Shield",
    description: "Prevent the next 4 damage",
    image: "/mystic-shield.png",
    rarity: CardRarity.COMMON,
    type: CardType.DEFENSE,
    defense: 4,
    mana: 2,
    tokenId: "0x2"
  },
  {
    id: "card-3",
    name: "Mana Surge",
    description: "Gain 3 mana crystals",
    image: "/mana-surge.png",
    rarity: CardRarity.RARE,
    type: CardType.UTILITY,
    mana: 1,
    tokenId: "0x3"
  },
  {
    id: "card-4",
    name: "Dragon's Breath",
    description: "Deal 8 damage to all enemies",
    image: "/dragons-breath.png",
    rarity: CardRarity.EPIC,
    type: CardType.ATTACK,
    attack: 8,
    mana: 6,
    tokenId: "0x4"
  },
  {
    id: "card-5",
    name: "Divine Intervention",
    description: "Restore 10 health points",
    image: "/divine-intervention.png",
    rarity: CardRarity.RARE,
    type: CardType.DEFENSE,
    defense: 10,
    mana: 4,
    tokenId: "0x5"
  },
  {
    id: "card-6",
    name: "MONDO Chainlink",
    description: "Connect to another player's blockchain",
    image: "/mondo-chainlink.png",
    rarity: CardRarity.LEGENDARY,
    type: CardType.UTILITY,
    mana: 5,
    tokenId: "0x6"
  },
  {
    id: "card-7",
    name: "Crypto Crusher",
    description: "Deal damage equal to your MONDO tokens",
    image: "/crypto-crusher.png",
    rarity: CardRarity.EPIC,
    type: CardType.ATTACK,
    attack: 7,
    mana: 5,
    tokenId: "0x7"
  },
  {
    id: "card-8",
    name: "Blockchain Barrier",
    description: "Create an immutable shield",
    image: "/blockchain-barrier.png",
    rarity: CardRarity.LEGENDARY,
    type: CardType.DEFENSE,
    defense: 12,
    mana: 7,
    tokenId: "0x8"
  }
];

export const players: Player[] = [
  {
    id: "player-1",
    username: "CryptoKing",
    address: "0x1234...5678",
    avatar: "/avatar-1.png",
    level: 24,
    experience: 2400,
    wins: 145,
    losses: 52,
    cards: [cards[0], cards[3], cards[5], cards[7]],
    tokens: 5000
  },
  {
    id: "player-2",
    username: "BlockchainQueen",
    address: "0x8765...4321",
    avatar: "/avatar-2.png",
    level: 19,
    experience: 1900,
    wins: 112,
    losses: 43,
    cards: [cards[1], cards[2], cards[6]],
    tokens: 3500
  },
  {
    id: "player-3",
    username: "MONDOMaster",
    address: "0x9876...1234",
    avatar: "/avatar-3.png",
    level: 30,
    experience: 3200,
    wins: 210,
    losses: 58,
    cards: [cards[0], cards[1], cards[4], cards[5], cards[7]],
    tokens: 8200
  },
  {
    id: "player-4",
    username: "TokenTrader",
    address: "0x5678...9012",
    avatar: "/avatar-4.png",
    level: 15,
    experience: 1500,
    wins: 89,
    losses: 67,
    cards: [cards[2], cards[3]],
    tokens: 2100
  },
  {
    id: "player-5",
    username: "NFTNinja",
    address: "0x3456...7890",
    avatar: "/avatar-5.png",
    level: 27,
    experience: 2700,
    wins: 163,
    losses: 42,
    cards: [cards[1], cards[6], cards[7]],
    tokens: 6300
  }
];

export const marketListings: MarketListing[] = [
  {
    id: "listing-1",
    card: cards[3],
    price: 500,
    seller: "0x1234...5678",
    timestamp: Date.now() - 86400000 // 1 day ago
  },
  {
    id: "listing-2",
    card: cards[5],
    price: 2500,
    seller: "0x8765...4321",
    timestamp: Date.now() - 43200000 // 12 hours ago
  },
  {
    id: "listing-3",
    card: cards[1],
    price: 150,
    seller: "0x9876...1234",
    timestamp: Date.now() - 21600000 // 6 hours ago
  },
  {
    id: "listing-4",
    card: cards[6],
    price: 850,
    seller: "0x5678...9012",
    timestamp: Date.now() - 7200000 // 2 hours ago
  }
];

export const currentPlayer: Player = {
  id: "player-current",
  username: "You",
  address: "0xAbCd...EfGh",
  avatar: "/avatar-default.png",
  level: 5,
  experience: 500,
  wins: 12,
  losses: 8,
  cards: [cards[0], cards[1], cards[2]],
  tokens: 1000
};
