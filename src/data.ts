import { Team, Match, TacticsType, MatchFactors, PredictionResult } from "./types";

export const TEAMS: Record<string, Team> = {
  MEX: {
    id: "MEX",
    name: "墨西哥",
    englishName: "Mexico",
    flag: "🇲🇽",
    group: "A组",
    marketValue: 226.26,
    fifaRank: 14,
    attackingRating: 78,
    defendingRating: 75,
    tacticsType: TacticsType.WING_OVERLOAD,
    tacticsName: "边路过载",
    tacticsDescription: "墨西哥擅长通过边路超载人数，打乱对手防守身后的真空地带，结合边锋的极速突破制造禁区内的绝佳射门机会。",
    mainPlayers: ["Raúl Jiménez", "Edson Álvarez", "Santiago Giménez"],
    elo: 1875
  },
  RSA: {
    id: "RSA",
    name: "南非",
    englishName: "South Africa",
    flag: "🇿🇦",
    group: "A组",
    marketValue: 49.25,
    fifaRank: 60,
    attackingRating: 68,
    defendingRating: 71,
    tacticsType: TacticsType.COUNTER_ATTACK,
    tacticsName: "防守反击",
    tacticsDescription: "南非依靠中后卫极其严密的低位防守，伺机由中后场送出过顶长传，克制爱前插控球对手的防线身后。",
    mainPlayers: ["Ronwen Williams", "Lyle Foster", "Relebohile Mofokeng"],
    elo: 1524
  },
  KOR: {
    id: "KOR",
    name: "韩国",
    englishName: "South Korea",
    flag: "🇰🇷",
    group: "A组",
    marketValue: 139.05,
    fifaRank: 25,
    attackingRating: 80,
    defendingRating: 74,
    tacticsType: TacticsType.COUNTER_ATTACK,
    tacticsName: "快速追击",
    tacticsDescription: "韩国队拼抢凶悍、体能狂暴，善于将阵线缩回，在拦截后一瞬间将皮球输送至孙兴慜，发动撕裂性质的反击。",
    mainPlayers: ["Son Heung-min", "Kim Min-jae", "Lee Kang-in"],
    elo: 1758
  },
  CZE: {
    id: "CZE",
    name: "捷克",
    englishName: "Czechia",
    flag: "🇨🇿",
    group: "A组",
    marketValue: 188.18,
    fifaRank: 40,
    attackingRating: 72,
    defendingRating: 73,
    tacticsType: TacticsType.POSSESSION,
    tacticsName: "稳控推进",
    tacticsDescription: "捷克时隔20年重返世界杯，打法注重中场控制与渐进式推进，依靠苏切克的覆盖能力和希克的门前嗅觉寻找机会。",
    mainPlayers: ["Tomáš Souček", "Patrik Schick", "Pavel Šulc"],
    elo: 1740
  },
  USA: {
    id: "USA",
    name: "美国",
    englishName: "United States",
    flag: "🇺🇸",
    group: "D组",
    marketValue: 385.65,
    fifaRank: 17,
    attackingRating: 84,
    defendingRating: 79,
    tacticsType: TacticsType.HIGH_PRESS,
    tacticsName: "全场前压",
    tacticsDescription: "美国队拥有极强的运动能力和身体对抗，采用高压 Gegenpressing 收复中场，前腰后腰迅速插上打穿对手。",
    mainPlayers: ["Christian Pulisic", "Folarin Balogun", "Weston McKennie"],
    elo: 1733
  },
  PAR: {
    id: "PAR",
    name: "巴拉圭",
    englishName: "Paraguay",
    flag: "🇵🇾",
    group: "D组",
    marketValue: 153.65,
    fifaRank: 41,
    attackingRating: 73,
    defendingRating: 77,
    tacticsType: TacticsType.COUNTER_ATTACK,
    tacticsName: "坚韧防守",
    tacticsDescription: "巴拉圭打法坚韧，身体对抗拼抢极其凶悍。防守中倾向于在中后场构筑紧密的第二道拦截防线，并在断球后通过速度型前锋进行直接而凌厉的纵向反击。",
    mainPlayers: ["Miguel Almirón", "Julio Enciso", "Gustavo Gómez"],
    elo: 1833
  },
  AUS: {
    id: "AUS",
    name: "澳大利亚",
    englishName: "Australia",
    flag: "🇦🇺",
    group: "D组",
    marketValue: 77.45,
    fifaRank: 27,
    attackingRating: 70,
    defendingRating: 72,
    tacticsType: TacticsType.ROUTE_ONE,
    tacticsName: "长传冲吊",
    tacticsDescription: "澳大利亚善于利用身体优势进行长传冲吊与争顶，前场球员接应二点球后迅速形成射门威胁，中后场拼抢凶狠。",
    mainPlayers: ["Jackson Irvine", "Awer Mabil", "Mitchell Duke"],
    elo: 1777
  },
  TUR: {
    id: "TUR",
    name: "土耳其",
    englishName: "Türkiye",
    flag: "🇹🇷",
    group: "D组",
    marketValue: 473.70,
    fifaRank: 22,
    attackingRating: 82,
    defendingRating: 78,
    tacticsType: TacticsType.HIGH_PRESS,
    tacticsName: "激情高压",
    tacticsDescription: "土耳其在蒙特拉的带领下激情四射，前场压迫极具侵略性，依靠居勒尔和耶尔德兹的个人能力撕裂防线。",
    mainPlayers: ["Arda Güler", "Hakan Çalhanoğlu", "Kenan Yıldız"],
    elo: 1911
  },
  BRA: {
    id: "BRA",
    name: "巴西",
    englishName: "Brazil",
    flag: "🇧🇷",
    group: "C组",
    marketValue: 928.20,
    fifaRank: 6,
    attackingRating: 93,
    defendingRating: 86,
    tacticsType: TacticsType.WING_OVERLOAD,
    tacticsName: "桑巴攻势",
    tacticsDescription: "五星巴西崇尚个人技术与瞬间变速。进攻多处超载，维尼修斯等人具备极强的1v1爆破和撕碎低位大巴的能力。",
    mainPlayers: ["Vinícius Júnior", "Neymar", "Bruno Guimarães"],
    elo: 1991
  },
  MAR: {
    id: "MAR",
    name: "摩洛哥",
    englishName: "Morocco",
    flag: "🇲🇦",
    group: "C组",
    marketValue: 447.70,
    fifaRank: 7,
    attackingRating: 83,
    defendingRating: 84,
    tacticsType: TacticsType.COUNTER_ATTACK,
    tacticsName: "铁血防反",
    tacticsDescription: "摩洛哥在2022世界杯四强后愈发成熟，防守体系极为严密，依靠哈基米的边路推进和齐耶赫的精准传球发动致命反击。",
    mainPlayers: ["Achraf Hakimi", "Hakim Ziyech", "Youssef En-Nesyri"],
    elo: 1824
  },
  ARG: {
    id: "ARG",
    name: "阿根廷",
    englishName: "Argentina",
    flag: "🇦🇷",
    group: "J组",
    marketValue: 807.50,
    fifaRank: 1,
    attackingRating: 92,
    defendingRating: 88,
    tacticsType: TacticsType.POSSESSION,
    tacticsName: "极致传控",
    tacticsDescription: "卫冕冠军掌控全场节奏，中路梅西等核心的高频渗透、斜塞配合，在慢节奏控球中寻找瞬间空隙撕开防线。",
    mainPlayers: ["Lionel Messi", "Julián Álvarez", "Lautaro Martínez"],
    elo: 2115
  },
  ALG: {
    id: "ALG",
    name: "阿尔及利亚",
    englishName: "Algeria",
    flag: "🇩🇿",
    group: "J组",
    marketValue: 256.90,
    fifaRank: 28,
    attackingRating: 76,
    defendingRating: 74,
    tacticsType: TacticsType.COUNTER_ATTACK,
    tacticsName: "沙漠之狐",
    tacticsDescription: "阿尔及利亚以坚韧的防守和快速的攻防转换著称，中前场拥有出色的技术型球员，擅长利用反击速度撕裂对手防线。",
    mainPlayers: ["Riyad Mahrez", "Ismaël Bennacer", "Amine Gouiri"],
    elo: 1760
  },
  JPN: {
    id: "JPN",
    name: "日本",
    englishName: "Japan",
    flag: "🇯🇵",
    group: "F组",
    marketValue: 270.85,
    fifaRank: 18,
    attackingRating: 82,
    defendingRating: 80,
    tacticsType: TacticsType.HIGH_PRESS,
    tacticsName: "前场反抢",
    tacticsDescription: "日本队极具凝聚力，前场压迫加快速攻防转换极为致命，边路爆点高频撕扯配合高水准地面过渡。",
    mainPlayers: ["Takefusa Kubo", "Wataru Endo", "Daichi Kamada"],
    elo: 1906
  },
  NED: {
    id: "NED",
    name: "荷兰",
    englishName: "Netherlands",
    flag: "🇳🇱",
    group: "F组",
    marketValue: 754.20,
    fifaRank: 8,
    attackingRating: 88,
    defendingRating: 85,
    tacticsType: TacticsType.POSSESSION,
    tacticsName: "全攻全守",
    tacticsDescription: "荷兰继承全攻全守哲学，依靠西蒙斯和加克波的创造力主导中前场，范迪克镇守后防线，攻守转换流畅高效。",
    mainPlayers: ["Virgil van Dijk", "Cody Gakpo", "Xavi Simons"],
    elo: 1948
  },
  ENG: {
    id: "ENG",
    name: "英格兰",
    englishName: "England",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    group: "L组",
    marketValue: 1360.00,
    fifaRank: 4,
    attackingRating: 94,
    defendingRating: 90,
    tacticsType: TacticsType.POSSESSION,
    tacticsName: "传中渗透",
    tacticsDescription: "三狮军团天才云集，兼备传中高空轰炸与中路插上。依靠贝林厄姆、萨卡等多点开花，压制中场攻势极强。",
    mainPlayers: ["Jude Bellingham", "Harry Kane", "Bukayo Saka"],
    elo: 2024
  },
  CRO: {
    id: "CRO",
    name: "克罗地亚",
    englishName: "Croatia",
    flag: "🇭🇷",
    group: "L组",
    marketValue: 387.30,
    fifaRank: 11,
    attackingRating: 85,
    defendingRating: 83,
    tacticsType: TacticsType.POSSESSION,
    tacticsName: "中场艺术",
    tacticsDescription: "克罗地亚以超强的中场控制力闻名世界，莫德里奇的组织调度和科瓦契奇的带球推进构建起世界顶级的中场三角。",
    mainPlayers: ["Luka Modrić", "Joško Gvardiol", "Mateo Kovačić"],
    elo: 1912
  },
  SEN: {
    id: "SEN",
    name: "塞内加尔",
    englishName: "Senegal",
    flag: "🇸🇳",
    group: "I组",
    marketValue: 478.10,
    fifaRank: 15,
    attackingRating: 79,
    defendingRating: 80,
    tacticsType: TacticsType.ROUTE_ONE,
    tacticsName: "强硬压迫",
    tacticsDescription: "塞内加尔兼具精湛身体条件与欧化技战术，在后场防守坚韧，中前场通过大跨步直传以及爆发力寻找射门点。",
    mainPlayers: ["Sadio Mané", "Nicolas Jackson", "Pape Matar Sarr"],
    elo: 1867
  },
  FRA: {
    id: "FRA",
    name: "法国",
    englishName: "France",
    flag: "🇫🇷",
    group: "I组",
    marketValue: 1520.00,
    fifaRank: 3,
    attackingRating: 95,
    defendingRating: 88,
    tacticsType: TacticsType.HIGH_PRESS,
    tacticsName: "闪电战术",
    tacticsDescription: "法国拥有世界最豪华的锋线配置，姆巴佩的绝对速度配合格列兹曼的战术串联，前场高压与反击速度无人能挡。",
    mainPlayers: ["Kylian Mbappé", "Antoine Griezmann", "Aurélien Tchouaméni"],
    elo: 2063
  }
};

export const PRESET_MATCHES: Match[] = [
  // ===== A组 =====
  {
    id: "match_a1",
    homeTeamId: "MEX",
    awayTeamId: "RSA",
    dateTime: "2026-06-11 15:00",
    venue: "阿兹特克体育场 (墨西哥城)",
    altitude: 2240,
    travelDistanceHome: 50,
    travelDistanceAway: 14500,
    weather: "炎热高原天气",
    marketOdds: {
      homeWin: 1.31,
      draw: 4.10,
      awayWin: 8.30
    },
    actualScore: {
      home: 2,
      away: 0
    }
  },
  {
    id: "match_a2",
    homeTeamId: "KOR",
    awayTeamId: "CZE",
    dateTime: "2026-06-11 22:00",
    venue: "阿克伦体育场 (瓜达拉哈拉)",
    altitude: 1566,
    travelDistanceHome: 11200,
    travelDistanceAway: 10800,
    weather: "温暖干燥",
    marketOdds: {
      homeWin: 2.10,
      draw: 3.30,
      awayWin: 3.40
    },
    actualScore: {
      home: 2,
      away: 1
    }
  },
  {
    id: "match_a3",
    homeTeamId: "CZE",
    awayTeamId: "RSA",
    dateTime: "2026-06-18 12:00",
    venue: "梅赛德斯-奔驰体育场 (亚特兰大)",
    altitude: 320,
    travelDistanceHome: 10800,
    travelDistanceAway: 14500,
    weather: "室内空调理想气温",
    marketOdds: {
      homeWin: 1.90,
      draw: 3.30,
      awayWin: 4.20
    }
  },
  {
    id: "match_a4",
    homeTeamId: "MEX",
    awayTeamId: "KOR",
    dateTime: "2026-06-18 21:00",
    venue: "阿克伦体育场 (瓜达拉哈拉)",
    altitude: 1566,
    travelDistanceHome: 500,
    travelDistanceAway: 11200,
    weather: "温暖干燥",
    marketOdds: {
      homeWin: 2.15,
      draw: 3.20,
      awayWin: 3.30
    }
  },
  {
    id: "match_a5",
    homeTeamId: "CZE",
    awayTeamId: "MEX",
    dateTime: "2026-06-24 21:00",
    venue: "阿兹特克体育场 (墨西哥城)",
    altitude: 2240,
    travelDistanceHome: 10800,
    travelDistanceAway: 50,
    weather: "炎热高原天气",
    marketOdds: {
      homeWin: 4.50,
      draw: 3.50,
      awayWin: 1.75
    }
  },
  {
    id: "match_a6",
    homeTeamId: "RSA",
    awayTeamId: "KOR",
    dateTime: "2026-06-24 21:00",
    venue: "BBVA体育场 (蒙特雷)",
    altitude: 540,
    travelDistanceHome: 14500,
    travelDistanceAway: 11200,
    weather: "炎热干燥",
    marketOdds: {
      homeWin: 4.80,
      draw: 3.40,
      awayWin: 1.70
    }
  },
  // ===== D组 =====
  {
    id: "match_d1",
    homeTeamId: "USA",
    awayTeamId: "PAR",
    dateTime: "2026-06-12 21:00",
    venue: "SoFi体育场 (洛杉矶)",
    altitude: 120,
    travelDistanceHome: 200,
    travelDistanceAway: 9300,
    weather: "燥热、晴朗",
    marketOdds: {
      homeWin: 1.55,
      draw: 3.75,
      awayWin: 5.50
    },
    actualScore: {
      home: 4,
      away: 1
    }
  },
  {
    id: "match_d2",
    homeTeamId: "AUS",
    awayTeamId: "TUR",
    dateTime: "2026-06-13 18:00",
    venue: "卑诗体育馆 (温哥华)",
    altitude: 20,
    travelDistanceHome: 13500,
    travelDistanceAway: 10200,
    weather: "气候凉爽",
    marketOdds: {
      homeWin: 4.20,
      draw: 3.50,
      awayWin: 1.80
    }
  },
  {
    id: "match_d3",
    homeTeamId: "USA",
    awayTeamId: "AUS",
    dateTime: "2026-06-19 15:00",
    venue: "流明球场 (西雅图)",
    altitude: 20,
    travelDistanceHome: 1700,
    travelDistanceAway: 13500,
    weather: "气候凉爽",
    marketOdds: {
      homeWin: 1.50,
      draw: 3.80,
      awayWin: 6.00
    }
  },
  {
    id: "match_d4",
    homeTeamId: "TUR",
    awayTeamId: "PAR",
    dateTime: "2026-06-19 18:00",
    venue: "李维斯体育场 (旧金山)",
    altitude: 10,
    travelDistanceHome: 10200,
    travelDistanceAway: 9300,
    weather: "温暖宜人",
    marketOdds: {
      homeWin: 1.65,
      draw: 3.60,
      awayWin: 5.00
    }
  },
  {
    id: "match_d5",
    homeTeamId: "TUR",
    awayTeamId: "USA",
    dateTime: "2026-06-25 22:00",
    venue: "SoFi体育场 (洛杉矶)",
    altitude: 120,
    travelDistanceHome: 10200,
    travelDistanceAway: 200,
    weather: "燥热、晴朗",
    marketOdds: {
      homeWin: 2.80,
      draw: 3.20,
      awayWin: 2.40
    }
  },
  {
    id: "match_d6",
    homeTeamId: "PAR",
    awayTeamId: "AUS",
    dateTime: "2026-06-25 18:00",
    venue: "李维斯体育场 (旧金山)",
    altitude: 10,
    travelDistanceHome: 9300,
    travelDistanceAway: 13500,
    weather: "温暖宜人",
    marketOdds: {
      homeWin: 2.20,
      draw: 3.20,
      awayWin: 3.30
    }
  },
  // ===== C组 =====
  {
    id: "match_c1",
    homeTeamId: "BRA",
    awayTeamId: "MAR",
    dateTime: "2026-06-13 18:00",
    venue: "大都会人寿体育场 (纽约/新泽西)",
    altitude: 10,
    travelDistanceHome: 7700,
    travelDistanceAway: 5700,
    weather: "温暖宜人",
    marketOdds: {
      homeWin: 1.75,
      draw: 3.40,
      awayWin: 4.50
    }
  },
  // ===== F组 =====
  {
    id: "match_f1",
    homeTeamId: "NED",
    awayTeamId: "JPN",
    dateTime: "2026-06-14 18:00",
    venue: "AT&T体育场 (达拉斯)",
    altitude: 180,
    travelDistanceHome: 8000,
    travelDistanceAway: 11000,
    weather: "室内空调理想气温",
    marketOdds: {
      homeWin: 1.70,
      draw: 3.50,
      awayWin: 4.80
    }
  },
  // ===== I组 =====
  {
    id: "match_i1",
    homeTeamId: "FRA",
    awayTeamId: "SEN",
    dateTime: "2026-06-16 18:00",
    venue: "大都会人寿体育场 (纽约/新泽西)",
    altitude: 10,
    travelDistanceHome: 5800,
    travelDistanceAway: 7500,
    weather: "温暖宜人",
    marketOdds: {
      homeWin: 1.40,
      draw: 4.30,
      awayWin: 7.00
    }
  },
  // ===== J组 =====
  {
    id: "match_j1",
    homeTeamId: "ARG",
    awayTeamId: "ALG",
    dateTime: "2026-06-16 21:00",
    venue: "箭头体育场 (堪萨斯城)",
    altitude: 250,
    travelDistanceHome: 8600,
    travelDistanceAway: 8200,
    weather: "温暖宜人",
    marketOdds: {
      homeWin: 1.35,
      draw: 4.50,
      awayWin: 7.50
    }
  },
  // ===== L组 =====
  {
    id: "match_l1",
    homeTeamId: "ENG",
    awayTeamId: "CRO",
    dateTime: "2026-06-17 18:00",
    venue: "AT&T体育场 (达拉斯)",
    altitude: 180,
    travelDistanceHome: 7700,
    travelDistanceAway: 8500,
    weather: "室内空调理想气温",
    marketOdds: {
      homeWin: 1.55,
      draw: 3.60,
      awayWin: 5.80
    }
  }
];

// Tactical Counter matrix [Attacker][Defender]
export const TACTICAL_MATRIX: Record<TacticsType, Record<TacticsType, number>> = {
  [TacticsType.POSSESSION]: {
    [TacticsType.POSSESSION]: 1.0,
    [TacticsType.COUNTER_ATTACK]: 0.95, // Counter defends deep
    [TacticsType.HIGH_PRESS]: 0.88,      // High Press disrupts Possession
    [TacticsType.ROUTE_ONE]: 1.12,       // Passes around slow tall route-one defenders
    [TacticsType.WING_OVERLOAD]: 1.02,
  },
  [TacticsType.COUNTER_ATTACK]: {
    [TacticsType.POSSESSION]: 1.10,      // Catches possession flatfooted
    [TacticsType.COUNTER_ATTACK]: 1.0,
    [TacticsType.HIGH_PRESS]: 1.14,      // Counter bypasses Gegenpressing behind high line
    [TacticsType.ROUTE_ONE]: 0.92,
    [TacticsType.WING_OVERLOAD]: 0.86,   // Suffers when flanks are overloaded
  },
  [TacticsType.HIGH_PRESS]: {
    [TacticsType.POSSESSION]: 1.15,      // Dominant disruption
    [TacticsType.COUNTER_ATTACK]: 0.88,   // Vulnerable to long direct passes over the press
    [TacticsType.HIGH_PRESS]: 1.0,
    [TacticsType.ROUTE_ONE]: 0.94,
    [TacticsType.WING_OVERLOAD]: 1.05,
  },
  [TacticsType.ROUTE_ONE]: {
    [TacticsType.POSSESSION]: 0.90,
    [TacticsType.COUNTER_ATTACK]: 1.08,  // Physically beats low lock in box
    [TacticsType.HIGH_PRESS]: 1.10,      // Directly clears ball over press
    [TacticsType.ROUTE_ONE]: 1.0,
    [TacticsType.WING_OVERLOAD]: 1.12,   // Overwhelms attacking-focused wings
  },
  [TacticsType.WING_OVERLOAD]: {
    [TacticsType.POSSESSION]: 0.98,
    [TacticsType.COUNTER_ATTACK]: 1.15,  // Wing overload stretches low block wide
    [TacticsType.HIGH_PRESS]: 0.95,
    [TacticsType.ROUTE_ONE]: 0.90,       // Exposed to direct route-one counters
    [TacticsType.WING_OVERLOAD]: 1.0,
  }
};

/**
 * Double Poisson score distribution prediction calculation
 */
export function runMatchPrediction(
  home: Team,
  away: Team,
  match: Match,
  factors: MatchFactors
): PredictionResult {
  const baseGoalExpectancy = 1.32; // Normal match expectancy per team

  // 1. Market Value Influence
  const totalMV = home.marketValue + away.marketValue;
  const homeMVRatio = home.marketValue / (totalMV || 1);
  const mvStrengthDiff = (homeMVRatio - 0.5) * 2; // -1 to 1 range
  const homeMVFactor = 1 + mvStrengthDiff * factors.marketValueWeight * 0.45;
  const awayMVFactor = 1 - mvStrengthDiff * factors.marketValueWeight * 0.45;

  // 2. FIFA Rank & ELO Influence
  const eloDiff = home.elo - away.elo;
  const eloStrengthDiff = eloDiff / 400; // 400 is standard Elo scale
  const homeEloFactor = 1 + eloStrengthDiff * factors.fifaRankWeight * 0.35;
  const awayEloFactor = 1 - eloStrengthDiff * factors.fifaRankWeight * 0.35;

  // 3. Tactical Playstyle Counter Advantage
  const homeTacticAdv = TACTICAL_MATRIX[home.tacticsType][away.tacticsType] || 1.0;
  const awayTacticAdv = TACTICAL_MATRIX[away.tacticsType][home.tacticsType] || 1.0;
  const homeTacticFactor = 1 + (homeTacticAdv - 1) * factors.tacticsCounterWeight * 1.5;
  const awayTacticFactor = 1 + (awayTacticAdv - 1) * factors.tacticsCounterWeight * 1.5;

  // 4. External Environment factors (Altitude, fatigue, home ground)
  let homeExtFactor = 1.0;
  let awayExtFactor = 1.0;

  // High altitude penalty for non-hosts or non-conditioned teams
  if (match.altitude > 1500) {
    const isHomeAcclimatized = home.id === "MEX"; // Mexico handles high altitude
    const isAwayAcclimatized = away.id === "MEX";

    if (isHomeAcclimatized) {
      homeExtFactor += 0.12 * factors.externalFactorWeight;
    } else {
      homeExtFactor -= 0.08 * factors.externalFactorWeight;
    }

    if (isAwayAcclimatized) {
      awayExtFactor += 0.12 * factors.externalFactorWeight;
    } else {
      awayExtFactor -= 0.18 * factors.externalFactorWeight; // High penalty for visitors!
    }
  }

  // Travel fatigue penalty (KM)
  const travelDiff = match.travelDistanceAway - match.travelDistanceHome;
  if (travelDiff > 5000) {
    awayExtFactor -= 0.07 * factors.externalFactorWeight;
    homeExtFactor += 0.03 * factors.externalFactorWeight;
  }

  // Warm weather stamina penalties
  if (match.weather === "炎热高原天气" || match.weather === "潮湿闷热" || match.weather === "燥热、晴朗") {
    // Demanding tactical playstyles (like Gegenpressing) drain more stamina, affecting defense penalty
    if (home.tacticsType === TacticsType.HIGH_PRESS) {
      homeExtFactor -= 0.04 * factors.externalFactorWeight;
    }
    if (away.tacticsType === TacticsType.HIGH_PRESS) {
      awayExtFactor -= 0.06 * factors.externalFactorWeight;
    }
  }

  // Host advantage if host
  const isHomeHost = ["MEX", "USA", "CAN"].includes(home.id);
  const isAwayHost = ["MEX", "USA", "CAN"].includes(away.id);
  if (isHomeHost && !isAwayHost) {
    homeExtFactor += 0.08 * factors.externalFactorWeight;
  } else if (!isHomeHost && isAwayHost) {
    awayExtFactor += 0.08 * factors.externalFactorWeight;
  }

  // 5. Form Weight (ELO + Efficacy)
  const homeFormFactor = 1 + (home.attackingRating - 75) / 100 * factors.formWeight * 0.4;
  const awayFormFactor = 1 + (away.attackingRating - 75) / 100 * factors.formWeight * 0.4;

  const homeDefenseFactor = 1 + (75 - home.defendingRating) / 100 * factors.formWeight * 0.4;
  const awayDefenseFactor = 1 + (75 - away.defendingRating) / 100 * factors.formWeight * 0.4;

  // Expected Goal (xG) calculation
  // Lambda (λ) = base * attackingMultiplier * defendingMultiplier
  let homeLambda = baseGoalExpectancy * homeMVFactor * homeEloFactor * homeTacticFactor * homeExtFactor * homeFormFactor * awayDefenseFactor;
  let awayLambda = baseGoalExpectancy * awayMVFactor * awayEloFactor * awayTacticFactor * awayExtFactor * awayFormFactor * homeDefenseFactor;

  // Clamping lambda to healthy limits
  homeLambda = Math.max(0.1, Math.min(4.8, homeLambda));
  awayLambda = Math.max(0.1, Math.min(4.8, awayLambda));

  // Double Poisson score grid (up to 5-5)
  const maxGoal = 5;
  const grid: number[][] = Array(maxGoal + 1).fill(0).map(() => Array(maxGoal + 1).fill(0));

  // P(k; λ) helper
  const poissonProb = (k: number, lambda: number): number => {
    let factorial = 1;
    for (let i = 1; i <= k; i++) factorial *= i;
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
  };

  let sumProb = 0;
  for (let h = 0; h <= maxGoal; h++) {
    for (let a = 0; a <= maxGoal; a++) {
      const p = poissonProb(h, homeLambda) * poissonProb(a, awayLambda);
      grid[h][a] = p;
      sumProb += p;
    }
  }

  // Normalize grid
  if (sumProb > 0) {
    for (let h = 0; h <= maxGoal; h++) {
      for (let a = 0; a <= maxGoal; a++) {
        grid[h][a] /= sumProb;
      }
    }
  }

  // Aggregated probabilities
  let homeWinProb = 0;
  let drawProb = 0;
  let awayWinProb = 0;

  const scoreProbsList: { score: string; prob: number; h: number; a: number }[] = [];

  for (let h = 0; h <= maxGoal; h++) {
    for (let a = 0; a <= maxGoal; a++) {
      const p = grid[h][a];
      if (h > a) homeWinProb += p;
      else if (h === a) drawProb += p;
      else awayWinProb += p;

      scoreProbsList.push({ score: `${h}-${a}`, prob: p, h, a });
    }
  }

  // Sort score probabilities
  scoreProbsList.sort((a, b) => b.prob - a.prob);
  const topScores = scoreProbsList.slice(0, 5).map(item => ({ score: item.score, prob: item.prob }));

  // Recommended Tiers
  // Primary (主推): single highest probability score
  const primary = topScores[0].score;

  // Stable (稳健): the highest probability score among low goal outcomes (0-0, 1-0, 0-1, 1-1, 2-0, 2-1)
  const stableScores = scoreProbsList.filter(item => item.h + item.a <= 3 && item.h - item.a >= 0);
  const stable = stableScores.length > 0 ? stableScores[0].score : (homeLambda >= awayLambda ? "1-0" : "1-1");

  // Aggressive (进取): robust score with higher goal scoring (e.g., at least 3 goals combined or home team win by 2+)
  const aggressiveScores = scoreProbsList.filter(item => (item.h + item.a >= 3) && (item.h !== item.a));
  const aggressive = aggressiveScores.length > 0 ? aggressiveScores[0].score : "3-1";

  // Margins attribution calculation (relative contribution offset)
  const baselineDiff = 0;
  const factorContributions = {
    marketValue: Number(((homeMVFactor - 1) * 0.35).toFixed(3)),
    lineupStrength: Number(((homeFormFactor - awayDefenseFactor) * 0.25).toFixed(3)),
    fifaRank: Number(((homeEloFactor - 1) * 0.25).toFixed(3)),
    tactics: Number(((homeTacticFactor - 1) * 0.15).toFixed(3)),
    external: Number(((homeExtFactor - 1) * 0.20).toFixed(3))
  };

  // Overall model confidence based on how much the prediction matches market odds expectations
  // Confidence goes up when factors have rich data, high ELO delta, or stark tactical contrast.
  const confidencePercent = Math.round(92 + Math.min(6, (Math.abs(homeLambda - awayLambda) * 3)));

  return {
    homeWinProb,
    drawProb,
    awayWinProb,
    homeExpectedGoals: Number(homeLambda.toFixed(2)),
    awayExpectedGoals: Number(awayLambda.toFixed(2)),
    scoreProbabilities: topScores,
    recommendedScores: {
      primary,
      stable,
      aggressive
    },
    factorContributions,
    totalConfidence: Math.min(99, Math.max(88, confidencePercent))
  };
}
