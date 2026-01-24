import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

interface DemographicsData {
  ageGroups: Array<{ range: string; percentage: number }>;
  population: number;
  medianIncome: number;
}

const COLORS = ["#FF7F50", "#B0E0E6", "#8B9CAD", "#424b6d", "#FAF0E6"];

export function DemographicsChart({ data }: { data: DemographicsData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Age Distribution */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-2 text-white">
          <span className="w-2 h-6 bg-secondary rounded-full" />
          Age Distribution
        </h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.ageGroups}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="percentage"
              >
                {data.ageGroups.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.2)" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f0f11', 
                  border: '1px solid #333', 
                  borderRadius: '8px',
                  color: '#fff' 
                }}
                formatter={(value: number) => [`${value}%`, 'Percentage']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {data.ageGroups.map((group, index) => (
            <div key={group.range} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
              <span className="text-xs text-white/80">{group.range} ({group.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="flex flex-col gap-6">
        <div className="glass-card rounded-2xl p-8 flex flex-col justify-center items-center text-center border-t-4 border-t-secondary relative overflow-hidden flex-1">
          <div className="absolute inset-0 bg-secondary/5" />
          <h4 className="text-muted-foreground text-sm uppercase tracking-wider mb-2 font-medium z-10">Total Population (5mi radius)</h4>
          <p className="text-4xl md:text-5xl font-display font-bold text-white z-10">
            {data.population.toLocaleString()}
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 flex flex-col justify-center items-center text-center border-t-4 border-t-primary relative overflow-hidden flex-1">
          <div className="absolute inset-0 bg-primary/5" />
          <h4 className="text-muted-foreground text-sm uppercase tracking-wider mb-2 font-medium z-10">Median Household Income</h4>
          <p className="text-4xl md:text-5xl font-display font-bold text-white z-10">
            ${data.medianIncome.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
