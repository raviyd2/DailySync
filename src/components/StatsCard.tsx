import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export default function StatsCard({ title, value, icon, trend, trendUp }: StatsCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-2xl border border-gray-100 transition-all">
      <div className="p-4 sm:p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="rounded-md bg-indigo-50 p-3">
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      {trend && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <span className={trendUp ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
              {trend}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
