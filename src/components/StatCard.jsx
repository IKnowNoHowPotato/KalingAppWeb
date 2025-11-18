export default function StatCard({ title, value, change, icon: IconComponent, color = 'from-blue-500 to-blue-600' }) {
  // IconComponent is a Lucide React icon component, render it as JSX
  const Icon = IconComponent;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 transition-all duration-300 ease-out hover:shadow-lg hover:-translate-y-1 group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {change && <p className="text-xs text-gray-600 mt-2">{change}</p>}
        </div>
        <div className={`p-3 rounded-lg bg-gradient-to-br ${color} group-hover:scale-110 transition-transform duration-300 ease-out`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  );
}
