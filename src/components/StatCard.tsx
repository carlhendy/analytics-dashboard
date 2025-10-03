interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  percentage?: number;
  footer?: string;
  className?: string;
}

export default function StatCard({ title, value, change, changePercent, percentage, footer, className = '' }: StatCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm p-6 ${className}`}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <div className="text-3xl font-bold text-gray-900 mb-1">
        {typeof value === 'string' ? value : value.toLocaleString()}
      </div>
      {change !== undefined && changePercent !== undefined && (
        <div className={`text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change.toLocaleString()} ({changePercent >= 0 ? '+' : ''}{changePercent}%)
        </div>
      )}
      {percentage !== undefined && (
        <div className="text-lg font-semibold text-blue-600 mb-2">
          {percentage.toFixed(1)}%
        </div>
      )}
      {footer && (
        <p className="text-sm text-gray-500">{footer}</p>
      )}
    </div>
  );
}