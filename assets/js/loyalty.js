// VIP Loyalty Data & Rules

const VIP_TIERS = [
  {
    id: "silver",
    name: "Silver",
    threshold: 0,
    earnRate: 1, // 1 point per $1
    perks: ["Complimentary standard shipping", "Birthday gift (500 pts)"]
  },
  {
    id: "gold",
    name: "Gold",
    threshold: 1000,
    earnRate: 1.5,
    perks: ["Expedited shipping", "Early access to new scents", "Birthday gift (1000 pts)"]
  },
  {
    id: "platinum",
    name: "Platinum",
    threshold: 3000,
    earnRate: 2,
    perks: ["Complimentary engraving", "Private concierge", "Exclusive masterclass invitations"]
  }
];

const LOYALTY_RULES = {
  redemptionRate: 0.05, // 100 points = $5 -> 1 point = $0.05
  welcomeBonus: 200,
  reviewBonus: 50
};

const REWARDS_CATALOG = [
  { id: "r1", name: "$10 Off Next Purchase", cost: 200 },
  { id: "r2", name: "Free Discovery Sample", cost: 300 },
  { id: "r3", name: "Complimentary Custom Engraving", cost: 500 },
  { id: "r4", name: "Exclusive Miniature (10ml)", cost: 1000 }
];

function getUserTier(points) {
  if (points >= VIP_TIERS[2].threshold) return VIP_TIERS[2];
  if (points >= VIP_TIERS[1].threshold) return VIP_TIERS[1];
  return VIP_TIERS[0];
}

function calculatePointsEarned(subtotal, tier) {
  return Math.floor(subtotal * tier.earnRate);
}

window.LoyaltyData = {
  VIP_TIERS,
  LOYALTY_RULES,
  REWARDS_CATALOG,
  getUserTier,
  calculatePointsEarned
};
