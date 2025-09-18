/**
 * Pages populaires - DONNÉES 100% RÉELLES
 */

import React, { memo } from 'react';

interface Page {
  page: string;
  views: number;
  uniqueVisitors: number;
  avgTimeOnPage: number;
}

interface PopularPagesProps {
  pages: Page[];
  isLoading?: boolean;
}

const PageRow: React.FC<{ page: Page; index: number }> = memo(({ page, index }) => {
  const getPageIcon = (pagePath: string) => {
    if (pagePath === '/') return '🏠';
    if (pagePath.includes('blog')) return '📝';
    if (pagePath.includes('service')) return '⚙️';
    if (pagePath.includes('contact')) return '📞';
    if (pagePath.includes('about')) return 'ℹ️';
    return '📄';
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-lg mr-3">{getPageIcon(page.page)}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">{page.page}</div>
            <div className="text-sm text-gray-500">#{index + 1} la plus visitée</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900 font-medium">{page.views.toLocaleString('fr-FR')}</div>
        <div className="text-sm text-gray-500">pages vues</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{page.uniqueVisitors || 0}</div>
        <div className="text-sm text-gray-500">visiteurs uniques</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {page.avgTimeOnPage ? formatTime(page.avgTimeOnPage) : '0s'}
        </div>
        <div className="text-sm text-gray-500">temps moyen</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((page.views / Math.max(...pages.map(p => p.views))) * 100, 100)}%` }}
          ></div>
        </div>
      </td>
    </tr>
  );
});

PageRow.displayName = 'PageRow';

export const PopularPages: React.FC<PopularPagesProps> = memo(({ 
  pages, 
  isLoading = false 
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow animate-pulse">
        <div className="p-6 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const sortedPages = pages.sort((a, b) => b.views - a.views);
  const totalViews = pages.reduce((sum, page) => sum + page.views, 0);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Pages Populaires</h3>
            <p className="text-sm text-gray-500 mt-1">
              {totalViews.toLocaleString('fr-FR')} pages vues au total
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Données temps réel</p>
            <p className="text-xs text-gray-400">Analytics OMA Digital</p>
          </div>
        </div>
      </div>

      {sortedPages.length === 0 ? (
        <div className="p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune donnée de navigation</h3>
          <p className="mt-1 text-sm text-gray-500">
            Les statistiques de pages apparaîtront dès qu'il y aura des visites.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Page
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visiteurs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Temps
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Popularité
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedPages.slice(0, 5).map((page, index) => (
                <PageRow key={page.page} page={page} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sortedPages.length > 5 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
            Voir toutes les pages ({sortedPages.length}) →
          </button>
        </div>
      )}
    </div>
  );
});

PopularPages.displayName = 'PopularPages';

export default PopularPages;