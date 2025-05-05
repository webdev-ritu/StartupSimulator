import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CapTable() {
  const { data: capTableData, isLoading } = useQuery({
    queryKey: ["/api/founder/cap-table"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-6 py-5 border-b border-gray-200">
          <CardTitle className="text-lg font-semibold text-gray-900">Cap Table Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-52 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create SVG pie chart data
  const createPieChart = () => {
    const data = capTableData?.shareholders || [];
    let cumulativeAngle = 0;
    
    return (
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="mx-auto block">
        <circle cx="50" cy="50" r="40" fill="white" />
        
        {data.map((shareholder: any, index: number) => {
          const startAngle = cumulativeAngle;
          const percentage = shareholder.percentage;
          const sliceAngle = percentage * 3.6; // 3.6 degrees per percentage point (360 / 100)
          cumulativeAngle += sliceAngle;
          
          // Convert angles to radians for calculation
          const startAngleRad = (startAngle - 90) * (Math.PI / 180);
          const endAngleRad = (startAngle + sliceAngle - 90) * (Math.PI / 180);
          
          // Calculate points on the circle
          const x1 = 50 + 40 * Math.cos(startAngleRad);
          const y1 = 50 + 40 * Math.sin(startAngleRad);
          const x2 = 50 + 40 * Math.cos(endAngleRad);
          const y2 = 50 + 40 * Math.sin(endAngleRad);
          
          // Determine if the arc should be drawn the long way around
          const largeArcFlag = sliceAngle > 180 ? 1 : 0;
          
          // Path for the slice
          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`
          ].join(' ');
          
          return (
            <path
              key={index}
              d={pathData}
              fill={shareholder.color}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
        
        {/* Inner white circle to create donut chart */}
        <circle cx="50" cy="50" r="20" fill="white" />
      </svg>
    );
  };

  return (
    <Card>
      <CardHeader className="px-6 py-5 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900">Cap Table Summary</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {/* Chart */}
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center h-52">
          <div className="relative w-32 h-32">
            {createPieChart()}
          </div>
          {/* Legend */}
          <div className="ml-6">
            {capTableData?.shareholders.map((shareholder: any, index: number) => (
              <div key={index} className="flex items-center mb-2">
                <span 
                  className="w-3 h-3 rounded-sm mr-2" 
                  style={{ backgroundColor: shareholder.color }}
                />
                <span className="text-sm text-gray-600">
                  {shareholder.type} ({shareholder.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <Button variant="link" className="w-full text-center text-sm text-primary-600 hover:text-primary-500 mt-4">
          View Full Cap Table
        </Button>
      </CardContent>
    </Card>
  );
}
