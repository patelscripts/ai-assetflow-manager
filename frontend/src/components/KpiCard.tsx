import React from 'react';

interface KpiCardProps {
	label: string;
	value: number | string;
	icon?: React.ComponentType<any>;
	color?: string; // e.g. 'text-green-600 bg-green-50'
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon: Icon, color = 'text-gray-600 bg-gray-50' }) => {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
			<div className={`p-3 rounded-lg ${color}`}>
				{Icon ? <Icon size={22} /> : <div className="w-5 h-5" />}
			</div>
			<div>
				<p className="text-2xl font-bold text-gray-900">{value}</p>
				<p className="text-sm text-gray-500">{label}</p>
			</div>
		</div>
	);
};

export default KpiCard;
