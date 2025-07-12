'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  LightBulbIcon,
  ClockIcon,
  CurrencyDollarIcon,
  FireIcon,
  CloudIcon,
  DevicePhoneMobileIcon,
  HomeIcon,
  CheckCircleIcon,
  XMarkIcon,
  StarIcon,
  TrophyIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { EnergySavingsTip, SavingsTipCategory, UserProfile } from '@/types/energy';
import { classNames } from '@/lib/utils';

interface SavingsTipsProps {
  tips: EnergySavingsTip[];
  userProfile: UserProfile;
  completedTips?: string[];
  onTipComplete?: (tipId: string) => void;
  onTipDismiss?: (tipId: string) => void;
  category?: SavingsTipCategory;
  showPersonalized?: boolean;
  maxTips?: number;
  compact?: boolean;
  isLoading?: boolean;
  className?: string;
}

/**
 * SavingsTips component provides personalized energy saving recommendations
 * Features: Categorized tips, completion tracking, personalized recommendations
 */
export function SavingsTips({
  tips,
  userProfile,
  completedTips = [],
  onTipComplete,
  onTipDismiss,
  category,
  showPersonalized = true,
  maxTips = 10,
  compact = false,
  isLoading = false,
  className = ''
}: SavingsTipsProps) {
  const [selectedCategory, setSelectedCategory] = useState<SavingsTipCategory | 'all'>('all');
  const [expandedTips, setExpandedTips] = useState<Set<string>>(new Set());
  const [showCompleted, setShowCompleted] = useState(false);

  // Filter and sort tips
  const filteredTips = useMemo(() => {
    let filtered = tips;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tip => tip.category === selectedCategory);
    }

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(tip => !completedTips.includes(tip.id));
    }

    // Sort by priority and potential savings
    filtered.sort((a, b) => {
      // Priority order: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by potential savings
      return b.potentialSavings - a.potentialSavings;
    });

    return filtered.slice(0, maxTips);
  }, [tips, selectedCategory, showCompleted, completedTips, maxTips]);

  // Personalized recommendations based on user profile
  const personalizedTips = useMemo(() => {
    if (!showPersonalized) return [];

    const recommendations = [];

    // Home type specific tips
    if (userProfile.homeType === 'apartment') {
      recommendations.push({
        id: 'apartment-heating',
        title: 'Apartment Heating Optimization',
        description: 'In apartments, focus on window sealing and draft prevention for maximum efficiency.',
        category: 'heating' as SavingsTipCategory,
        difficulty: 'easy' as const,
        potentialSavings: 15,
        estimatedTime: '30 minutes',
        priority: 'medium' as const,
        steps: [
          'Check for drafts around windows and doors',
          'Apply weather stripping where needed',
          'Use draft stoppers under doors'
        ],
        tools: ['Weather stripping', 'Draft stoppers'],
        isPersonalized: true
      });
    }

    // Household size specific tips
    if (userProfile.householdSize > 3) {
      recommendations.push({
        id: 'large-family-efficiency',
        title: 'Large Family Energy Tips',
        description: 'With multiple family members, focus on coordinated energy use and efficient appliances.',
        category: 'appliances' as SavingsTipCategory,
        difficulty: 'medium' as const,
        potentialSavings: 40,
        estimatedTime: '1 hour',
        priority: 'high' as const,
        steps: [
          'Coordinate laundry schedules',
          'Use energy-efficient appliances during off-peak hours',
          'Implement a family energy-saving plan'
        ],
        tools: ['Smart scheduling', 'Energy monitoring'],
        isPersonalized: true
      });
    }

    // Usage pattern specific tips
    if (userProfile.averageUsage > 1000) {
      recommendations.push({
        id: 'high-usage-optimization',
        title: 'High Usage Optimization',
        description: 'Your energy usage is above average. Focus on major energy consumers first.',
        category: 'general' as SavingsTipCategory,
        difficulty: 'medium' as const,
        potentialSavings: 80,
        estimatedTime: '2 hours',
        priority: 'high' as const,
        steps: [
          'Identify your highest energy-consuming devices',
          'Upgrade to energy-efficient alternatives',
          'Implement smart power management'
        ],
        tools: ['Energy monitor', 'Smart plugs'],
        isPersonalized: true
      });
    }

    return recommendations;
  }, [userProfile, showPersonalized]);

  // All tips including personalized ones
  const allTips = useMemo(() => {
    return [...personalizedTips, ...filteredTips];
  }, [personalizedTips, filteredTips]);

  // Category icons
  const categoryIcons = {
    heating: FireIcon,
    cooling: CloudIcon,
    lighting: LightBulbIcon,
    appliances: DevicePhoneMobileIcon,
    general: HomeIcon
  };

  // Category colors
  const categoryColors = {
    heating: 'text-red-500',
    cooling: 'text-blue-500',
    lighting: 'text-yellow-500',
    appliances: 'text-purple-500',
    general: 'text-gray-500'
  };

  const toggleTipExpansion = (tipId: string) => {
    setExpandedTips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tipId)) {
        newSet.delete(tipId);
      } else {
        newSet.add(tipId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium': return 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'text-gray-500 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getDifficultyStars = (difficulty: string) => {
    const stars = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return Array.from({ length: 5 }, (_, i) => (
      i < stars ? (
        <StarIconSolid key={i} className="h-3 w-3 text-yellow-500" />
      ) : (
        <StarIcon key={i} className="h-3 w-3 text-gray-300" />
      )
    ));
  };

  if (isLoading) {
    return (
      <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow p-6', className)}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow p-4', className)}>
        <div className="flex items-center space-x-2 mb-3">
          <LightBulbIcon className="h-5 w-5 text-yellow-500" />
          <h3 className="text-md font-semibold text-gray-900 dark:text-white">
            Quick Tips
          </h3>
        </div>
        <div className="space-y-2">
          {allTips.slice(0, 3).map((tip) => (
            <div
              key={tip.id}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/50 rounded"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {tip.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Save ${tip.potentialSavings}/month
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex">{getDifficultyStars(tip.difficulty)}</div>
                {completedTips.includes(tip.id) ? (
                  <CheckCircleIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 text-gray-400" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={classNames('bg-white dark:bg-gray-800 rounded-lg shadow', className)}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <LightBulbIcon className="h-6 w-6 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Energy Savings Tips
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SavingsTipCategory | 'all')}
              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-yellow-500"
            >
              <option value="all">All Categories</option>
              <option value="heating">Heating</option>
              <option value="cooling">Cooling</option>
              <option value="lighting">Lighting</option>
              <option value="appliances">Appliances</option>
              <option value="general">General</option>
            </select>

            {/* Show Completed Toggle */}
            <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
              />
              <span>Show completed</span>
            </label>
          </div>
        </div>
      </div>

      {/* Personalized Tips Section */}
      {showPersonalized && personalizedTips.length > 0 && (
        <div className="mx-6 mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-center space-x-2 mb-3">
            <TrophyIcon className="h-5 w-5 text-yellow-600" />
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              Personalized for You
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personalizedTips.map((tip) => (
              <div
                key={tip.id}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                    {tip.title}
                  </h5>
                  <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                    ${tip.potentialSavings}/mo
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  {tip.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex">{getDifficultyStars(tip.difficulty)}</div>
                  <button
                    onClick={() => toggleTipExpansion(tip.id)}
                    className="text-xs text-yellow-600 hover:text-yellow-700 dark:text-yellow-400"
                  >
                    {expandedTips.has(tip.id) ? 'Show less' : 'Show more'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips List */}
      <div className="px-6 pb-4">
        <div className="space-y-4">
          {allTips.map((tip) => {
            const isCompleted = completedTips.includes(tip.id);
            const isExpanded = expandedTips.has(tip.id);
            const CategoryIcon = categoryIcons[tip.category];
            const categoryColor = categoryColors[tip.category];

            return (
              <div
                key={tip.id}
                className={classNames(
                  'border rounded-lg p-4 transition-all duration-200',
                  isCompleted 
                    ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                  tip.isPersonalized && 'ring-2 ring-yellow-200 dark:ring-yellow-800'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <CategoryIcon className={classNames('h-5 w-5', categoryColor)} />
                      <h4 className="text-md font-medium text-gray-900 dark:text-white">
                        {tip.title}
                      </h4>
                      {tip.isPersonalized && (
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded">
                          Personalized
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {tip.description}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <CurrencyDollarIcon className="h-4 w-4" />
                        <span>${tip.potentialSavings}/month</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="h-4 w-4" />
                        <span>{tip.estimatedTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>Difficulty:</span>
                        <div className="flex">{getDifficultyStars(tip.difficulty)}</div>
                      </div>
                      <div className={classNames('px-2 py-1 rounded text-xs font-medium', getPriorityColor(tip.priority))}>
                        {tip.priority}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {!isCompleted && (
                      <>
                        <button
                          onClick={() => toggleTipExpansion(tip.id)}
                          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          <ChevronRightIcon 
                            className={classNames(
                              'h-4 w-4 transition-transform',
                              isExpanded && 'rotate-90'
                            )} 
                          />
                        </button>
                        <button
                          onClick={() => onTipComplete?.(tip.id)}
                          className="p-2 text-green-500 hover:text-green-700 dark:text-green-400"
                          title="Mark as completed"
                        >
                          <CheckCircleIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onTipDismiss?.(tip.id)}
                          className="p-2 text-red-500 hover:text-red-700 dark:text-red-400"
                          title="Dismiss"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {isCompleted && (
                      <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                        <CheckCircleIcon className="h-5 w-5" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Steps to Complete:
                        </h5>
                        <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {tip.steps.map((step, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-yellow-500 font-medium">{index + 1}.</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      <div>
                        <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Tools/Materials Needed:
                        </h5>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          {tip.tools.map((tool, index) => (
                            <li key={index} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                              <span>{tool}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-b-lg">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {allTips.length} tips • {completedTips.length} completed
          </div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            Potential monthly savings: ${allTips.reduce((sum, tip) => sum + tip.potentialSavings, 0)}
          </div>
        </div>
      </div>
    </div>
  );
}
