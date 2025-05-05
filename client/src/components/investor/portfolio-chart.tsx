import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface PortfolioChartProps {
  portfolioData: {
    monthlyValues: {
      month: string;
      value: number;
    }[];
    totalInvested: number;
    currentValue: number;
    roi: number;
    startupsFunded: number;
  };
}

export default function PortfolioChart({ portfolioData }: PortfolioChartProps) {
  // Find the min and max values for scaling
  const values = portfolioData.monthlyValues.map(item => item.value);
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;
  
  // Calculate percentages for each point
  const points = portfolioData.monthlyValues.map((item, index) => {
    const percentage = range === 0 ? 0 : ((item.value - minValue) / range) * 100;
    return {
      x: (index / (portfolioData.monthlyValues.length - 1)) * 100,
      y: 100 - percentage, // Invert for SVG coordinates
      value: item.value,
      month: item.month,
    };
  });
  
  // Create path string for the line
  const linePath = points.map((point, i) => 
    `${i === 0 ? "M" : "L"} ${point.x} ${point.y}`
  ).join(" ");
  
  // Create area path (line + bottom)
  const areaPath = `
    ${linePath} 
    L ${points[points.length - 1].x} 100 
    L 0 100 
    Z
  `;
  
  return (
    <>
      {/* Chart Placeholder */}
      <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center h-64">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Background grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line 
              key={`grid-y-${y}`}
              x1="0" 
              y1={y} 
              x2="100" 
              y2={y} 
              stroke="#e5e7eb" 
              strokeWidth="0.5"
            />
          ))}
          
          {/* Area under the line */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            opacity="0.2"
          />
          
          {/* Line chart */}
          <path
            d={linePath}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="1"
          />
          
          {/* Points */}
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="1"
              fill="hsl(var(--primary))"
            />
          ))}
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Y-axis Labels */}
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        {portfolioData.monthlyValues.map((item, i) => (
          <span key={i}>{item.month}</span>
        ))}
      </div>
    </>
  );
}
