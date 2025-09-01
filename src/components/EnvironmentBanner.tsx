import React from 'react';
import { useGlobalData } from '@/contexts/GlobalDataProviderReal';

const EnvironmentBanner: React.FC = () => {
  const { envInfo, isReady } = useGlobalData();

  // Don't show banner until data is ready
  if (!isReady) {
    return null;
  }

  // Only show banner if backend says to show it or if we're in staging
  if (!envInfo || !envInfo.show_banner) {
    return null;
  }

  // Dynamic styling based on environment color
  const getBackgroundClass = (color: string) => {
    switch (color) {
      case 'yellow':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'blue':
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
      case 'green':
        return 'bg-gradient-to-r from-green-400 to-green-600';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${getBackgroundClass(envInfo.color)} text-black text-center py-2 px-4 shadow-lg`}>
      <div className="flex items-center justify-center space-x-2">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 ${envInfo.color === 'yellow' ? 'bg-yellow-600' : envInfo.color === 'blue' ? 'bg-blue-600' : 'bg-green-600'} rounded-full animate-pulse`}></div>
          <span className="font-bold text-sm uppercase tracking-wide">
            {envInfo.status}
          </span>
          <div className={`w-2 h-2 ${envInfo.color === 'yellow' ? 'bg-yellow-600' : envInfo.color === 'blue' ? 'bg-blue-600' : 'bg-green-600'} rounded-full animate-pulse`}></div>
        </div>
        <span className="text-xs opacity-80 hidden sm:inline">
          | {envInfo.database} | {envInfo.description}
        </span>
      </div>
    </div>
  );
};

export default EnvironmentBanner;