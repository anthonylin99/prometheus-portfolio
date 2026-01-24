import { Header } from '@/components/layout/Header';
import { AllocationDonut } from '@/components/charts/AllocationDonut';
import { HoldingsBar } from '@/components/charts/HoldingsBar';
import { CategoryCard } from '@/components/cards/CategoryCard';
import { TopHoldingCard } from '@/components/cards/TopHoldingCard';
import { StatCard } from '@/components/cards/StatCard';
import portfolioData from '@/data/portfolio.json';
import { Holding, Category } from '@/types/portfolio';
import { 
  calculatePortfolioTotal, 
  calculateCategoryData, 
  getTopHoldings,
  formatCurrency 
} from '@/lib/utils';
import { Wallet, PieChart, TrendingUp, Layers } from 'lucide-react';

export default function Dashboard() {
  const holdings = portfolioData.holdings as Holding[];
  const totalValue = calculatePortfolioTotal(holdings);
  const categoryData = calculateCategoryData(holdings);
  const topHoldings = getTopHoldings(holdings, 5);

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <Header 
        title="PathFinder ETF"
        subtitle="Personal Investment Portfolio"
        totalValue={totalValue}
        change={2847}
        changePercent={2.12}
        lastUpdated={portfolioData.lastUpdated}
      />

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          label="Total Holdings"
          value={holdings.length.toString()}
          icon={Wallet}
        />
        <StatCard 
          label="Categories"
          value={categoryData.length.toString()}
          icon={Layers}
        />
        <StatCard 
          label="Largest Position"
          value={formatCurrency(topHoldings[0]?.value || 0)}
          change={topHoldings[0]?.ticker}
          changeType="neutral"
          icon={TrendingUp}
        />
        <StatCard 
          label="Avg. Position Size"
          value={formatCurrency(totalValue / holdings.length)}
          icon={PieChart}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-8">
        {/* Holdings Bar Chart */}
        <div className="xl:col-span-7 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Holdings</h3>
              <p className="text-sm text-slate-400">Sorted by value</p>
            </div>
            <span className="text-sm text-slate-500">{holdings.length} positions</span>
          </div>
          <HoldingsBar holdings={holdings} />
        </div>

        {/* Allocation Donut */}
        <div className="xl:col-span-5 glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">Allocation</h3>
              <p className="text-sm text-slate-400">By category</p>
            </div>
          </div>
          <AllocationDonut data={categoryData} totalValue={totalValue} />
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Category Breakdown</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryData.map((category, index) => (
            <CategoryCard key={category.name} category={category} index={index} />
          ))}
        </div>
      </div>

      {/* Top Holdings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">Top Holdings</h3>
            <p className="text-sm text-slate-400">Largest positions in portfolio</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {topHoldings.map((holding, index) => (
            <TopHoldingCard 
              key={holding.ticker}
              holding={holding}
              rank={index + 1}
              portfolioPercentage={(holding.value / totalValue) * 100}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
