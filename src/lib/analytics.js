// Simple analytics wrapper - ready to use!

// Choose your analytics provider:
// 1. Google Analytics (free)
// 2. Mixpanel (product analytics)
// 3. PostHog (open source)
// 4. Vercel Analytics (easiest)

class Analytics {
  constructor() {
    this.provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'console'
  }

  // Track inventory events
  trackInventoryAction(action, data = {}) {
    const event = {
      event: 'inventory_action',
      action_type: action,
      timestamp: new Date().toISOString(),
      ...data
    }

    switch (this.provider) {
      case 'google':
        if (typeof gtag !== 'undefined') {
          gtag('event', 'inventory_action', event)
        }
        break
      
      case 'mixpanel':
        if (typeof mixpanel !== 'undefined') {
          mixpanel.track('Inventory Action', event)
        }
        break
      
      case 'posthog':
        if (typeof posthog !== 'undefined') {
          posthog.capture('inventory_action', event)
        }
        break
      
      default:
        console.log('📊 Analytics Event:', event)
    }
  }

  // Track user actions
  trackUserAction(action, data = {}) {
    this.trackInventoryAction(action, data)
  }

  // Track business metrics
  trackBusinessMetrics(metrics) {
    const event = {
      event: 'business_metrics',
      total_items: metrics.totalItems,
      total_value: metrics.totalValue,
      low_stock_items: metrics.lowStockItems,
      timestamp: new Date().toISOString()
    }

    switch (this.provider) {
      case 'google':
        if (typeof gtag !== 'undefined') {
          gtag('event', 'business_metrics', event)
        }
        break
      
      case 'mixpanel':
        if (typeof mixpanel !== 'undefined') {
          mixpanel.track('Business Metrics', event)
        }
        break
      
      case 'posthog':
        if (typeof posthog !== 'undefined') {
          posthog.capture('business_metrics', event)
        }
        break
      
      default:
        console.log('📈 Business Metrics:', event)
    }
  }
}

export const analytics = new Analytics()

// Ready-to-use tracking functions
export const trackEvents = {
  // Inventory actions
  itemAdded: (item) => analytics.trackInventoryAction('item_added', {
    item_name: item.itemName,
    item_price: item.itemPrice,
    stock_quantity: item.stockQuantity
  }),

  itemEdited: (item) => analytics.trackInventoryAction('item_edited', {
    item_id: item.id,
    item_name: item.itemName
  }),

  itemDeleted: (itemName) => analytics.trackInventoryAction('item_deleted', {
    item_name: itemName
  }),

  // User actions
  userLoggedIn: (email) => analytics.trackUserAction('user_logged_in', {
    user_email: email
  }),

  userSignedUp: (email) => analytics.trackUserAction('user_signed_up', {
    user_email: email
  }),

  // Search & Filter actions
  searchPerformed: (query) => analytics.trackUserAction('search_performed', {
    search_query: query
  }),

  filterApplied: (filters) => analytics.trackUserAction('filter_applied', {
    filter_types: Object.keys(filters),
    filter_count: Object.values(filters).flat().length
  }),

  // Business insights
  dashboardViewed: (metrics) => analytics.trackBusinessMetrics(metrics)
}
