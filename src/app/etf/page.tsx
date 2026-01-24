import { Header } from '@/components/layout/Header';
import { CompanyLogo } from '@/components/ui/CompanyLogo';
import portfolioData from '@/data/portfolio.json';
import { Holding, categoryColors, Category } from '@/types/portfolio';
import { 
  calculatePortfolioTotal, 
  calculateCategoryData, 
  formatCurrency, 
  formatPercentage 
} from '@/lib/utils';
import { 
  Compass, 
  Target, 
  TrendingUp, 
  Shield, 
  Zap, 
  Globe,
  Rocket,
  Cpu,
  Coins,
  Building2,
  Satellite,
  Bitcoin
} from 'lucide-react';

const categoryIcons: Record<Category, React.ReactNode> = {
  'Space & Satellite': <Satellite className="w-5 h-5" />,
  'Crypto Infrastructure': <Bitcoin className="w-5 h-5" />,
  'Fintech': <Coins className="w-5 h-5" />,
  'AI Infrastructure': <Cpu className="w-5 h-5" />,
  'Digital Asset Treasury': <Building2 className="w-5 h-5" />,
  'Big Tech': <Globe className="w-5 h-5" />,
};

const categoryDescriptions: Record<Category, string> = {
  'Space & Satellite': 'Investing in the commercialization of space and satellite-based communication networks',
  'Crypto Infrastructure': 'Core infrastructure enabling the digital asset ecosystem including mining, exchanges, and services',
  'Fintech': 'Next-generation financial technology platforms disrupting traditional financial services',
  'AI Infrastructure': 'Companies building and powering the artificial intelligence revolution',
  'Digital Asset Treasury': 'Corporate treasury strategies utilizing Bitcoin as a reserve asset',
  'Big Tech': 'Established technology giants with diversified growth opportunities',
};

export default function ETFPage() {
  const holdings = portfolioData.holdings as Holding[];
  const totalValue = calculatePortfolioTotal(holdings);
  const categoryData = calculateCategoryData(holdings);
  const topHoldings = [...holdings].sort((a, b) => b.value - a.value).slice(0, 10);

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      {/* Hero Section */}
      <div className="glass-card p-8 lg:p-12 rounded-3xl mb-8 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-cyan-600/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Compass className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                PathFinder ETF
              </h1>
              <p className="text-violet-400 font-medium">
                Hypothetical Personal Investment Fund
              </p>
            </div>
          </div>

          <p className="text-xl text-slate-300 max-w-3xl mb-8 leading-relaxed">
            A curated portfolio capturing the convergence of emerging technologies — 
            from space infrastructure to digital assets, fintech innovation to AI computing.
          </p>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Net Assets</p>
              <p className="text-2xl font-bold text-white tabular-nums">
                {formatCurrency(totalValue)}
              </p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Holdings</p>
              <p className="text-2xl font-bold text-white">{holdings.length}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Expense Ratio</p>
              <p className="text-2xl font-bold text-emerald-400">0.00%</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-sm text-slate-400 mb-1">Inception</p>
              <p className="text-2xl font-bold text-white">2024</p>
            </div>
          </div>
        </div>
      </div>

      {/* Investment Thesis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
              <Target className="w-5 h-5 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Investment Thesis</h2>
          </div>
          <div className="space-y-4 text-slate-300">
            <p>
              PathFinder ETF represents a conviction-based approach to identifying 
              transformative technologies at inflection points. The fund focuses on 
              companies building essential infrastructure for the next decade.
            </p>
            <p>
              Key themes include the monetization of space, the institutionalization 
              of digital assets, and the proliferation of AI across every industry.
            </p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Strategy</h2>
          </div>
          <ul className="space-y-3 text-slate-300">
            <li className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Concentrated positions in high-conviction names</span>
            </li>
            <li className="flex items-start gap-3">
              <Rocket className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
              <span>Early-stage exposure to emerging sectors</span>
            </li>
            <li className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span>Global exposure across markets and exchanges</span>
            </li>
            <li className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
              <span>Long-term horizon with tactical adjustments</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Category Weightings */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Category Weightings</h2>
        <div className="space-y-4">
          {categoryData.map((category) => {
            const color = categoryColors[category.name];
            return (
              <div key={category.name} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <span style={{ color }}>{categoryIcons[category.name]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white">{category.name}</p>
                      <p className="text-sm text-slate-400 hidden lg:block">
                        {categoryDescriptions[category.name]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white tabular-nums">
                      {formatPercentage(category.percentage)}
                    </p>
                    <p className="text-sm text-slate-400 tabular-nums">
                      {formatCurrency(category.value)}
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-700"
                    style={{ 
                      width: `${category.percentage}%`,
                      backgroundColor: color,
                      boxShadow: `0 0 12px ${color}40`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top 10 Holdings */}
      <div className="glass-card p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Top 10 Holdings</h2>
          <span className="text-sm text-slate-400">As of {new Date().toLocaleDateString()}</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left p-3 text-sm font-semibold text-slate-400">#</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-400">Holding</th>
                <th className="text-left p-3 text-sm font-semibold text-slate-400 hidden md:table-cell">Category</th>
                <th className="text-right p-3 text-sm font-semibold text-slate-400">Weight</th>
              </tr>
            </thead>
            <tbody>
              {topHoldings.map((holding, index) => {
                const percentage = (holding.value / totalValue) * 100;
                const color = categoryColors[holding.category];
                return (
                  <tr 
                    key={holding.ticker}
                    className="border-b border-slate-800/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3">
                      <span className="text-slate-500 font-medium">{index + 1}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <CompanyLogo ticker={holding.ticker} size="sm" />
                        <div>
                          <p className="font-semibold text-white">{holding.ticker}</p>
                          <p className="text-sm text-slate-400">{holding.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {holding.category}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <p className="font-bold text-white tabular-nums">
                        {formatPercentage(percentage)}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-sm text-slate-400">
            Top 10 represent {formatPercentage(
              topHoldings.reduce((sum, h) => sum + (h.value / totalValue) * 100, 0)
            )} of portfolio
          </span>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 rounded-xl bg-slate-900/30 border border-slate-800">
        <p className="text-xs text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Disclaimer:</strong> PathFinder ETF is a 
          hypothetical personal portfolio for educational and tracking purposes only. 
          This is not a registered investment fund and should not be construed as 
          investment advice. Past performance does not guarantee future results. 
          Investments involve risk including possible loss of principal.
        </p>
      </div>
    </div>
  );
}
