import { CategoryData, categoryGradients } from '@/types/portfolio';
import { formatCurrency, formatPercentage, cn } from '@/lib/utils';

interface CategoryCardProps {
  category: CategoryData;
  index: number;
}

export function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <div 
      className="glass-card p-4 rounded-xl hover:scale-[1.02] transition-transform animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div 
          className={cn(
            "w-3 h-3 rounded-full flex-shrink-0"
          )}
          style={{ backgroundColor: category.color }}
        />
        <h4 className="text-sm font-medium text-white truncate">
          {category.name}
        </h4>
      </div>
      
      <div className="space-y-1">
        <p className="text-xl font-bold text-white tabular-nums">
          {formatCurrency(category.value)}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">
            {formatPercentage(category.percentage)}
          </span>
          <span className="text-xs text-slate-500">
            {category.holdings.length} holding{category.holdings.length > 1 ? 's' : ''}
          </span>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-700"
          style={{ 
            width: `${category.percentage}%`,
            backgroundColor: category.color,
          }}
        />
      </div>
    </div>
  );
}
