import { Header } from '@/components/layout/Header';
import { HoldingsTable } from '@/components/tables/HoldingsTable';
import portfolioData from '@/data/portfolio.json';
import { Holding } from '@/types/portfolio';
import { calculatePortfolioTotal } from '@/lib/utils';

export default function HoldingsPage() {
  const holdings = portfolioData.holdings as Holding[];
  const totalValue = calculatePortfolioTotal(holdings);

  return (
    <div className="p-6 lg:p-8 min-h-screen">
      <Header 
        title="Holdings"
        subtitle="Manage and track all portfolio positions"
      />

      <HoldingsTable holdings={holdings} totalValue={totalValue} />
    </div>
  );
}
