import React from 'react';
import { Plus, BarChart3, Mail, Users, Calendar, Settings, FileText } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: 'chart' | 'mail' | 'users' | 'calendar' | 'settings' | 'document' | 'plus';
}

const iconMap = {
  chart: BarChart3,
  mail: Mail,
  users: Users,
  calendar: Calendar,
  settings: Settings,
  document: FileText,
  plus: Plus
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = 'chart'
}) => {
  const IconComponent = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {/* Icon */}
      <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
          <IconComponent className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>

      {/* Description */}
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        {description}
      </p>

      {/* Action Button - Only show if actionLabel and onAction are provided */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </button>
      )}


    </div>
  );
};

export default EmptyState;
