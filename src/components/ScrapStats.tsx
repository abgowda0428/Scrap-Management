import { ScrapItem } from '../App';
import { Package, Weight, DollarSign, Grid3x3 } from 'lucide-react';

interface ScrapStatsProps {
  items: ScrapItem[];
}

export function ScrapStats({ items }: ScrapStatsProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  const totalValue = items.reduce((sum, item) => sum + (item.weight * item.pricePerUnit), 0);
  const categories = new Set(items.map(item => item.category)).size;

  const stats = [
    {
      label: 'Total Items',
      value: totalItems.toLocaleString(),
      icon: Package,
      color: 'blue'
    },
    {
      label: 'Total Weight',
      value: `${totalWeight.toFixed(2)} kg`,
      icon: Weight,
      color: 'green'
    },
    {
      label: 'Total Value',
      value: `$${totalValue.toFixed(2)}`,
      icon: DollarSign,
      color: 'purple'
    },
    {
      label: 'Categories',
      value: categories.toString(),
      icon: Grid3x3,
      color: 'orange'
    }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
