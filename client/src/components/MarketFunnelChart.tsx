import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { motion } from "framer-motion";

interface MarketData {
  tam: { value: number; description: string };
  sam: { value: number; description: string };
  som: { value: number; description: string };
}

export function MarketFunnelChart({ data }: { data: MarketData }) {
  const chartData = [
    { name: "TAM", value: data.tam.value, color: "#B0E0E6", desc: "Total Addressable Market" },
    { name: "SAM", value: data.sam.value, color: "#424b6d", desc: "Serviceable Available Market" },
    { name: "SOM", value: data.som.value, color: "#FAF0E6", desc: "Serviceable Obtainable Market" },
  ];

  return (
    <div className="w-full h-[400px] glass-card rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      
      <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-8 bg-primary rounded-full" />
        Market Opportunity Funnel
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px]">
        {/* Metric Cards */}
        <div className="col-span-1 flex flex-col justify-center gap-4">
          {chartData.map((item, index) => (
            <motion.div 
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-lg text-white">{item.name}</span>
                <span className="text-xl font-display font-bold text-white">
                  {(item.value).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-white/60">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <div className="col-span-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fill: '#a1a1aa', fontSize: 12 }} 
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0f0f11', 
                  border: '1px solid #333', 
                  borderRadius: '8px',
                  color: '#fff' 
                }}
                itemStyle={{ color: '#fff' }}
                cursor={{ fill: '#ffffff05' }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
