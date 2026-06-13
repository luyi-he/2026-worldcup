/**
 * TypeScript Data Definitions for 2026 World Cup Prediction Tool
 */

export interface Team {
  id: string;
  name: string;
  englishName: string;
  flag: string; // Emoji flag
  group: string;
  marketValue: number; // in Millions of Euros, e.g., 191.85
  fifaRank: number;
  attackingRating: number; // 0 - 100
  defendingRating: number; // 0 - 100
  tacticsType: TacticsType;
  tacticsName: string;
  tacticsDescription: string;
  mainPlayers: string[];
  elo: number; // ELO rating, e.g. 1850
}

export enum TacticsType {
  POSSESSION = "POSSESSION",      // 传控渗透 (Tiki-Taka)
  COUNTER_ATTACK = "COUNTER",     // 防守反击 (Low Block & Counter)
  HIGH_PRESS = "HIGH_PRESS",      // 前场压迫 (Gegenpressing)
  ROUTE_ONE = "ROUTE_ONE",        // 长传轰炸 (Physical / Route One)
  WING_OVERLOAD = "WING_OVERLOAD" // 边路过载 (Wing Overload)
}

export interface MatchFactors {
  marketValueWeight: number;    // 身价因子权重
  tacticsCounterWeight: number; // 战术克制因子权重
  fifaRankWeight: number;       // FIFA/ELO权重
  externalFactorWeight: number; // 外部环境(高原/客行/天气)权重
  formWeight: number;           // 历史与近况权重
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  dateTime: string;
  venue: string;
  altitude: number; // Altitude in meters (e.g. Mexico City = 2240m)
  travelDistanceHome: number; // Travel distance in km
  travelDistanceAway: number; // Travel distance in km
  weather: string; // Dry, Hot, Humid, Rain, Perfect
  marketOdds: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  actualScore?: {
    home: number;
    away: number;
  };
}

export interface PredictionResult {
  homeWinProb: number;
  drawProb: number;
  awayWinProb: number;
  homeExpectedGoals: number;
  awayExpectedGoals: number;
  scoreProbabilities: { score: string; prob: number }[]; // Top 5
  recommendedScores: {
    primary: string; // 主推
    stable: string;  // 稳健
    aggressive: string; // 进取
  };
  factorContributions: {
    marketValue: number;  // Contribution to home probability margin
    lineupStrength: number;
    fifaRank: number;
    tactics: number;
    external: number;
  };
  totalConfidence: number; // e.g. 95%
}

export interface ExpertReview {
  tacticalCounter: string;
  squadCondition: string;
  pathAndTrend: string;
  primaryJudgment: string;
}
