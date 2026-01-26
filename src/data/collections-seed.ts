// Collections & Watchlist seed data
// 18 curated stock collections organized into 5 categories

export interface CollectionStock {
  ticker: string;
  note?: string; // Short one-liner about why it's in the collection
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  categoryId: string;
  icon: string; // Lucide icon name
  stocks: CollectionStock[];
  methodology: 'market-cap-weighted' | 'equal-weighted' | 'custom';
  riskLevel: 'low' | 'moderate' | 'high' | 'very-high';
  tags: string[];
}

export interface CollectionCategory {
  id: string;
  name: string;
  description: string;
  color: string; // Hex color for theming
  icon: string; // Lucide icon name
}

// ─── Categories ─────────────────────────────────────────────

export const collectionCategories: CollectionCategory[] = [
  {
    id: 'anchor-sleeves',
    name: 'Anchor Sleeves',
    description: 'Large-cap core positions that form the foundation of a well-diversified portfolio',
    color: '#6366f1', // indigo
    icon: 'Anchor',
  },
  {
    id: 'intelligence-compute',
    name: 'Intelligence & Compute',
    description: 'AI infrastructure, semiconductors, and cloud platforms powering the next era of computing',
    color: '#8b5cf6', // violet
    icon: 'Cpu',
  },
  {
    id: 'real-world-scarcity',
    name: 'Real-World Scarcity',
    description: 'Physical assets, energy, and finite resources with structural supply constraints',
    color: '#f59e0b', // amber
    icon: 'Gem',
  },
  {
    id: 'alternative-assets',
    name: 'Alternative Assets',
    description: 'Crypto, digital assets, and alternative investments beyond traditional equities',
    color: '#f97316', // orange
    icon: 'Coins',
  },
  {
    id: 'thematic-frontiers',
    name: 'Thematic Frontiers',
    description: 'Emerging themes and high-conviction sector bets shaping the future',
    color: '#06b6d4', // cyan
    icon: 'Rocket',
  },
];

// ─── Collections ────────────────────────────────────────────

export const collections: Collection[] = [
  // ── Anchor Sleeves ────────────────────────────────────────
  {
    id: 'magnificent-seven',
    name: 'The Magnificent Seven',
    description: 'The seven mega-cap tech giants driving the majority of S&P 500 returns. These companies dominate AI, cloud, advertising, e-commerce, and consumer tech.',
    categoryId: 'anchor-sleeves',
    icon: 'Crown',
    methodology: 'market-cap-weighted',
    riskLevel: 'moderate',
    tags: ['mega-cap', 'tech', 'core'],
    stocks: [
      { ticker: 'AAPL', note: 'Consumer ecosystem + services revenue flywheel' },
      { ticker: 'MSFT', note: 'Enterprise cloud + AI copilot integration' },
      { ticker: 'GOOGL', note: 'Search monopoly + Waymo + DeepMind' },
      { ticker: 'AMZN', note: 'AWS dominance + retail logistics moat' },
      { ticker: 'NVDA', note: 'GPU monopoly powering the AI revolution' },
      { ticker: 'META', note: 'Social graph + Reels monetization + Reality Labs' },
      { ticker: 'TSLA', note: 'EV scale + energy storage + FSD optionality' },
    ],
  },
  {
    id: 'dividend-aristocrats',
    name: 'Dividend Aristocrats',
    description: 'Companies with 25+ consecutive years of dividend increases. These businesses have proven their ability to compound shareholder value through economic cycles.',
    categoryId: 'anchor-sleeves',
    icon: 'BadgeDollarSign',
    methodology: 'equal-weighted',
    riskLevel: 'low',
    tags: ['dividends', 'income', 'defensive'],
    stocks: [
      { ticker: 'JNJ', note: '60+ years of dividend growth, healthcare conglomerate' },
      { ticker: 'PG', note: 'Consumer staples giant, pricing power across brands' },
      { ticker: 'KO', note: 'Global beverage distribution moat' },
      { ticker: 'PEP', note: 'Snacks + beverages dual growth engine' },
      { ticker: 'MMM', note: 'Diversified industrials with IP portfolio' },
      { ticker: 'ABT', note: 'Medical devices + diagnostics leader' },
      { ticker: 'WMT', note: 'Retail scale + e-commerce acceleration' },
      { ticker: 'MCD', note: 'Global franchise model with real estate optionality' },
    ],
  },
  {
    id: 'quality-compounders',
    name: 'Quality Compounders',
    description: 'High-ROIC businesses with durable competitive advantages and consistent earnings growth. These companies reinvest at high rates and compound capital for decades.',
    categoryId: 'anchor-sleeves',
    icon: 'TrendingUp',
    methodology: 'equal-weighted',
    riskLevel: 'moderate',
    tags: ['quality', 'growth', 'moat'],
    stocks: [
      { ticker: 'V', note: 'Payment rails duopoly with 50%+ margins' },
      { ticker: 'MA', note: 'Cross-border transactions + value-added services' },
      { ticker: 'COST', note: 'Membership model with fanatical customer loyalty' },
      { ticker: 'UNH', note: 'Healthcare vertical integration powerhouse' },
      { ticker: 'ISRG', note: 'Surgical robotics monopoly, 8,000+ installed da Vincis' },
      { ticker: 'TMO', note: 'Life sciences tools essential for drug discovery' },
      { ticker: 'ADBE', note: 'Creative + document cloud with AI-powered Firefly' },
    ],
  },

  // ── Intelligence & Compute ────────────────────────────────
  {
    id: 'ai-infrastructure',
    name: 'AI Infrastructure',
    description: 'The foundational hardware and semiconductor companies enabling the artificial intelligence revolution. From GPUs to networking chips to foundries, these are the picks and shovels of AI.',
    categoryId: 'intelligence-compute',
    icon: 'Brain',
    methodology: 'market-cap-weighted',
    riskLevel: 'high',
    tags: ['AI', 'semiconductors', 'GPUs'],
    stocks: [
      { ticker: 'NVDA', note: 'Data center GPU monopoly, CUDA ecosystem lock-in' },
      { ticker: 'AMD', note: 'MI300X gaining share in AI training/inference' },
      { ticker: 'AVGO', note: 'Custom AI accelerators + VMware enterprise cloud' },
      { ticker: 'MRVL', note: 'Custom silicon for cloud + 5G infrastructure' },
      { ticker: 'TSM', note: 'Foundry monopoly, manufactures 90% of advanced chips' },
      { ticker: 'ASML', note: 'EUV lithography monopoly, no alternative exists' },
      { ticker: 'ANET', note: 'AI data center networking at 800G speeds' },
      { ticker: 'SMCI', note: 'GPU server racks optimized for AI workloads' },
    ],
  },
  {
    id: 'cloud-hyperscalers',
    name: 'Cloud Hyperscalers',
    description: 'The dominant cloud computing platforms and SaaS leaders building the digital infrastructure for enterprises worldwide. Cloud is the new operating system for business.',
    categoryId: 'intelligence-compute',
    icon: 'Cloud',
    methodology: 'market-cap-weighted',
    riskLevel: 'moderate',
    tags: ['cloud', 'SaaS', 'enterprise'],
    stocks: [
      { ticker: 'AMZN', note: 'AWS: 32% cloud market share, Bedrock AI services' },
      { ticker: 'MSFT', note: 'Azure: fastest-growing hyperscaler, OpenAI partnership' },
      { ticker: 'GOOGL', note: 'GCP: strong in data analytics, Gemini AI models' },
      { ticker: 'CRM', note: 'Enterprise CRM leader, Einstein AI copilot' },
      { ticker: 'SNOW', note: 'Data cloud platform with cross-cloud data sharing' },
      { ticker: 'NET', note: 'Edge computing + Workers AI inference platform' },
      { ticker: 'DDOG', note: 'Full-stack observability for cloud infrastructure' },
      { ticker: 'MDB', note: 'Developer-first database, Atlas cloud growth' },
    ],
  },
  {
    id: 'picks-and-shovels',
    name: 'Picks & Shovels',
    description: 'These companies provide the critical infrastructure, power, and cooling systems that make AI data centers possible. They benefit from AI buildout regardless of which AI models win.',
    categoryId: 'intelligence-compute',
    icon: 'Pickaxe',
    methodology: 'equal-weighted',
    riskLevel: 'high',
    tags: ['infrastructure', 'data-centers', 'power'],
    stocks: [
      { ticker: 'ANET', note: 'High-speed networking for AI cluster interconnects' },
      { ticker: 'DELL', note: 'AI server assembly + enterprise PC refresh cycle' },
      { ticker: 'VRT', note: 'Data center cooling and power management' },
      { ticker: 'EQIX', note: 'Premium colocation, 260+ data centers globally' },
      { ticker: 'DLR', note: 'Hyperscale data center leasing for cloud giants' },
      { ticker: 'AME', note: 'Electronic instruments + power solutions for infrastructure' },
    ],
  },

  // ── Real-World Scarcity ───────────────────────────────────
  {
    id: 'nuclear-renaissance',
    name: 'Nuclear Renaissance',
    description: 'Nuclear power is experiencing a resurgence driven by AI data center energy demands and clean energy mandates. From uranium miners to SMR developers to nuclear utilities.',
    categoryId: 'real-world-scarcity',
    icon: 'Atom',
    methodology: 'equal-weighted',
    riskLevel: 'very-high',
    tags: ['nuclear', 'energy', 'uranium'],
    stocks: [
      { ticker: 'CCJ', note: 'Largest western uranium producer, long-term contracts' },
      { ticker: 'CEG', note: 'Largest US nuclear fleet operator, Microsoft PPA' },
      { ticker: 'VST', note: 'Texas power generator benefiting from AI demand' },
      { ticker: 'SMR', note: 'NuScale small modular reactor technology pioneer' },
      { ticker: 'NNE', note: 'Nano Nuclear micro-reactor developer' },
      { ticker: 'LEU', note: 'Only US-licensed HALEU uranium enrichment' },
      { ticker: 'UEC', note: 'US-based uranium mining and in-situ recovery' },
    ],
  },
  {
    id: 'energy-transition',
    name: 'Energy Transition',
    description: 'Companies at the forefront of the shift from fossil fuels to renewable energy. Solar, wind, battery storage, and green hydrogen are reshaping the global energy landscape.',
    categoryId: 'real-world-scarcity',
    icon: 'Sun',
    methodology: 'equal-weighted',
    riskLevel: 'high',
    tags: ['renewables', 'solar', 'clean-energy'],
    stocks: [
      { ticker: 'FSLR', note: 'US thin-film solar manufacturer, IRA beneficiary' },
      { ticker: 'ENPH', note: 'Microinverter technology for residential solar' },
      { ticker: 'NEE', note: 'Largest renewable energy generator in the world' },
      { ticker: 'AES', note: 'Utility-scale renewables + battery storage projects' },
      { ticker: 'BEP', note: 'Brookfield renewable power across hydro/wind/solar' },
      { ticker: 'PLUG', note: 'Green hydrogen fuel cell systems and electrolyzers' },
    ],
  },
  {
    id: 'commodities-supercycle',
    name: 'Commodities Supercycle',
    description: 'Mining and materials companies positioned for a structural commodity supercycle driven by electrification, infrastructure buildout, and supply underinvestment.',
    categoryId: 'real-world-scarcity',
    icon: 'Mountain',
    methodology: 'equal-weighted',
    riskLevel: 'high',
    tags: ['commodities', 'mining', 'materials'],
    stocks: [
      { ticker: 'FCX', note: 'Largest public copper producer, essential for electrification' },
      { ticker: 'NEM', note: 'World\'s largest gold miner, inflation hedge' },
      { ticker: 'BHP', note: 'Diversified mining giant: iron ore, copper, nickel' },
      { ticker: 'RIO', note: 'Iron ore + aluminum + lithium production' },
      { ticker: 'VALE', note: 'Iron ore + nickel for EV batteries' },
      { ticker: 'MP', note: 'Only US rare earth mine and processing facility' },
    ],
  },

  // ── Alternative Assets ────────────────────────────────────
  {
    id: 'bitcoin-treasury',
    name: 'Bitcoin Treasury Companies',
    description: 'Public companies that hold significant Bitcoin on their balance sheets as a treasury reserve strategy. These stocks offer leveraged exposure to Bitcoin price movements.',
    categoryId: 'alternative-assets',
    icon: 'Bitcoin',
    methodology: 'market-cap-weighted',
    riskLevel: 'very-high',
    tags: ['bitcoin', 'crypto', 'digital-assets'],
    stocks: [
      { ticker: 'MSTR', note: 'Largest corporate Bitcoin holder, 200k+ BTC treasury' },
      { ticker: 'MARA', note: 'Bitcoin mining at scale, HODL treasury strategy' },
      { ticker: 'CLSK', note: 'Low-cost Bitcoin mining with renewable energy' },
      { ticker: 'RIOT', note: 'Bitcoin mining + data center infrastructure' },
      { ticker: 'COIN', note: 'Largest US crypto exchange, institutional custody' },
      { ticker: 'HOOD', note: 'Retail crypto trading + Bitcoin rewards' },
    ],
  },
  {
    id: 'defi-picks',
    name: 'DeFi & Fintech Bridges',
    description: 'Companies bridging traditional finance and decentralized finance. These platforms are making crypto, payments, and financial services accessible to everyone.',
    categoryId: 'alternative-assets',
    icon: 'ArrowLeftRight',
    methodology: 'equal-weighted',
    riskLevel: 'high',
    tags: ['defi', 'fintech', 'payments'],
    stocks: [
      { ticker: 'COIN', note: 'Crypto exchange + Base L2 + staking services' },
      { ticker: 'HOOD', note: 'Zero-commission trading, 24/7 crypto access' },
      { ticker: 'SQ', note: 'Block: Cash App Bitcoin + Square merchant payments' },
      { ticker: 'PYPL', note: 'PYUSD stablecoin + crypto buy/sell/hold' },
      { ticker: 'AFRM', note: 'BNPL leader with honest no-late-fees model' },
      { ticker: 'SOFI', note: 'Digital bank + investing + crypto in one app' },
    ],
  },
  {
    id: 'real-assets',
    name: 'Real Assets & REITs',
    description: 'Real estate investment trusts and infrastructure companies providing stable income with inflation protection through ownership of physical assets.',
    categoryId: 'alternative-assets',
    icon: 'Building',
    methodology: 'equal-weighted',
    riskLevel: 'moderate',
    tags: ['REITs', 'real-estate', 'income'],
    stocks: [
      { ticker: 'AMT', note: 'Cell tower REIT, 5G infrastructure backbone' },
      { ticker: 'PLD', note: 'Industrial logistics REIT, e-commerce warehousing' },
      { ticker: 'O', note: 'Monthly dividend REIT, 15,000+ retail properties' },
      { ticker: 'SPG', note: 'Premium mall operator with mixed-use redevelopment' },
      { ticker: 'CCI', note: 'Cell towers + small cells + fiber infrastructure' },
      { ticker: 'VICI', note: 'Experiential REIT: casinos, hotels, entertainment' },
    ],
  },

  // ── Thematic Frontiers ────────────────────────────────────
  {
    id: 'space-economy',
    name: 'Space Economy',
    description: 'Companies commercializing space through satellite communications, launch services, and space-based infrastructure. The space economy is projected to reach $1 trillion by 2040.',
    categoryId: 'thematic-frontiers',
    icon: 'Rocket',
    methodology: 'equal-weighted',
    riskLevel: 'very-high',
    tags: ['space', 'satellites', 'launch'],
    stocks: [
      { ticker: 'ASTS', note: 'Space-based cellular broadband, direct-to-device' },
      { ticker: 'RKLB', note: 'Electron + Neutron rockets, space systems verticals' },
      { ticker: 'BA', note: 'Satellite manufacturing + Starliner crew vehicle' },
      { ticker: 'LMT', note: 'Military space + GPS satellites + missile defense' },
      { ticker: 'AXON', note: 'Connected public safety devices + AI analytics' },
      { ticker: 'PLTR', note: 'Defense + intelligence data analytics platform' },
    ],
  },
  {
    id: 'defense-dominance',
    name: 'Defense Dominance',
    description: 'Prime defense contractors benefiting from rising global defense budgets, geopolitical tensions, and technological modernization of military forces worldwide.',
    categoryId: 'thematic-frontiers',
    icon: 'Shield',
    methodology: 'market-cap-weighted',
    riskLevel: 'moderate',
    tags: ['defense', 'military', 'aerospace'],
    stocks: [
      { ticker: 'LMT', note: 'F-35 stealth fighter + hypersonic missiles' },
      { ticker: 'RTX', note: 'Pratt & Whitney engines + Raytheon missile systems' },
      { ticker: 'NOC', note: 'B-21 stealth bomber + autonomous systems' },
      { ticker: 'GD', note: 'Gulfstream jets + Abrams tanks + IT services' },
      { ticker: 'LHX', note: 'Electronic warfare + space sensors + comms' },
      { ticker: 'HII', note: 'Nuclear aircraft carriers + submarines builder' },
      { ticker: 'KTOS', note: 'Drone swarms + tactical unmanned systems' },
    ],
  },
  {
    id: 'longevity-biotech',
    name: 'Longevity & Biotech',
    description: 'Biotechnology companies pioneering gene therapy, CRISPR editing, mRNA platforms, and precision medicine. These innovations could extend healthy human lifespan significantly.',
    categoryId: 'thematic-frontiers',
    icon: 'Dna',
    methodology: 'equal-weighted',
    riskLevel: 'very-high',
    tags: ['biotech', 'genomics', 'gene-therapy'],
    stocks: [
      { ticker: 'ABBV', note: 'Immunology franchise + Allergan aesthetics' },
      { ticker: 'REGN', note: 'Antibody engineering platform, Dupixent blockbuster' },
      { ticker: 'VRTX', note: 'Cystic fibrosis dominance + pain pipeline' },
      { ticker: 'MRNA', note: 'mRNA platform for vaccines, cancer, rare diseases' },
      { ticker: 'ILMN', note: 'DNA sequencing instruments enabling precision medicine' },
      { ticker: 'CRSP', note: 'CRISPR gene editing, Casgevy first-ever approval' },
      { ticker: 'BEAM', note: 'Base editing: next-gen CRISPR without double-strand breaks' },
    ],
  },
  {
    id: 'fintech-revolution',
    name: 'Fintech Revolution',
    description: 'Technology companies disrupting traditional banking, payments, and financial services. From mobile banking to BNPL to restaurant tech, fintech is eating finance.',
    categoryId: 'thematic-frontiers',
    icon: 'Wallet',
    methodology: 'equal-weighted',
    riskLevel: 'high',
    tags: ['fintech', 'payments', 'banking'],
    stocks: [
      { ticker: 'SQ', note: 'Merchant payments ecosystem + Cash App consumer' },
      { ticker: 'PYPL', note: 'Digital payments pioneer with Venmo + Braintree' },
      { ticker: 'AFRM', note: 'Transparent BNPL with merchant GMV growth' },
      { ticker: 'SOFI', note: 'All-in-one digital bank: loans, invest, insurance' },
      { ticker: 'NU', note: 'Latin America\'s largest digital bank, 100M+ customers' },
      { ticker: 'TOST', note: 'Restaurant SaaS + payments + POS platform' },
      { ticker: 'BILL', note: 'SMB financial automation: AP, AR, spend management' },
    ],
  },
  {
    id: 'robotics-automation',
    name: 'Robotics & Automation',
    description: 'Companies building the robots, cobots, and automation systems transforming manufacturing, surgery, logistics, and everyday life.',
    categoryId: 'thematic-frontiers',
    icon: 'Bot',
    methodology: 'equal-weighted',
    riskLevel: 'high',
    tags: ['robotics', 'automation', 'manufacturing'],
    stocks: [
      { ticker: 'ISRG', note: 'da Vinci surgical robot with 8,000+ installations' },
      { ticker: 'ROK', note: 'Industrial automation + connected enterprise software' },
      { ticker: 'ABB', note: 'Industrial robots + electrification + motion control' },
      { ticker: 'FANUY', note: 'CNC + factory automation robots, global leader' },
      { ticker: 'TER', note: 'Semiconductor test equipment + cobot arms' },
      { ticker: 'IRBT', note: 'Consumer robotics pioneer with Roomba ecosystem' },
    ],
  },
  {
    id: 'cybersecurity-shield',
    name: 'Cybersecurity Shield',
    description: 'Companies protecting enterprises and governments from cyber threats. As digital attack surfaces expand, cybersecurity spend is becoming non-discretionary.',
    categoryId: 'thematic-frontiers',
    icon: 'ShieldCheck',
    methodology: 'equal-weighted',
    riskLevel: 'moderate',
    tags: ['cybersecurity', 'SaaS', 'security'],
    stocks: [
      { ticker: 'CRWD', note: 'Cloud-native endpoint security + AI threat detection' },
      { ticker: 'PANW', note: 'Network security platformization + Prisma Cloud' },
      { ticker: 'ZS', note: 'Zero-trust security cloud, replacing legacy VPNs' },
      { ticker: 'FTNT', note: 'Unified SASE + FortiGate next-gen firewalls' },
      { ticker: 'S', note: 'AI-powered autonomous endpoint protection' },
      { ticker: 'CYBR', note: 'Identity security + privileged access management' },
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────

export function getCollectionsByCategory(categoryId: string): Collection[] {
  return collections.filter(c => c.categoryId === categoryId);
}

export function getCollectionById(id: string): Collection | undefined {
  return collections.find(c => c.id === id);
}

export function getCategoryById(id: string): CollectionCategory | undefined {
  return collectionCategories.find(c => c.id === id);
}

export function getAllTickers(): string[] {
  const tickers = new Set<string>();
  collections.forEach(c => c.stocks.forEach(s => tickers.add(s.ticker)));
  return Array.from(tickers).sort();
}

export function getCollectionsForTicker(ticker: string): Collection[] {
  const t = ticker.toUpperCase();
  return collections.filter(c => c.stocks.some(s => s.ticker === t));
}
