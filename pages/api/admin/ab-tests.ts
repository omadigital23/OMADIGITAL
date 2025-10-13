import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { NEXT_PUBLIC_SUPABASE_URL } from '../../../src/lib/env-public';
import { SUPABASE_SERVICE_ROLE_KEY } from '../../../src/lib/env-server';

// Initialize Supabase client
const supabase = createClient(
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

import { requireAdminApi } from '../../../src/utils/adminApiGuard';

export default requireAdminApi(async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch A/B test results
    const { data: abTestResults, error: abTestError } = await supabase
      .from('ab_test_results')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1000);

    if (abTestError) {
      console.error('Error fetching A/B test results:', abTestError);
      return res.status(500).json({ error: 'Failed to fetch A/B test results' });
    }

    // Fetch analytics events for additional context
    const { data: analyticsEvents, error: eventsError } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (eventsError) {
      console.error('Error fetching analytics events:', eventsError);
      // Continue without analytics events if there's an error
    }

    // Process the data to group by test name and variant
    const processedData = processABTestData(abTestResults || [], analyticsEvents || []);

    res.status(200).json({
      abTestResults: processedData,
      totalResults: abTestResults?.length || 0,
      totalEvents: analyticsEvents?.length || 0
    });
  } catch (error) {
    console.error('A/B Tests API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process A/B test data to group by test name and variant
function processABTestData(abTestResults: any[], analyticsEvents: any[]) {
  // Group results by test name
  const groupedResults: Record<string, any> = {};
  
  abTestResults.forEach(result => {
    const testName = result.test_name;
    const variant = result.variant;
    
    if (!groupedResults[testName]) {
      groupedResults[testName] = {
        testName,
        variants: {},
        totalConversions: 0,
        totalAssignments: 0
      };
    }
    
    if (!groupedResults[testName].variants[variant]) {
      groupedResults[testName].variants[variant] = {
        variant,
        conversions: 0,
        assignments: 0,
        conversionRate: 0
      };
    }
    
    // Count assignments and conversions
    groupedResults[testName].variants[variant].assignments++;
    groupedResults[testName].totalAssignments++;
    
    if (result.conversion) {
      groupedResults[testName].variants[variant].conversions++;
      groupedResults[testName].totalConversions++;
    }
    
    // Calculate conversion rate
    const variantData = groupedResults[testName].variants[variant];
    variantData.conversionRate = variantData.assignments > 0 
      ? (variantData.conversions / variantData.assignments) * 100 
      : 0;
  });
  
  // Convert to array format
  return Object.values(groupedResults).map(test => {
    return {
      ...test,
      variants: Object.values(test.variants)
    };
  });
}