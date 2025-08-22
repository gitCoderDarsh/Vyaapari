// Gemini AI Integration for Vyaapari
// Smart inventory management with AI
import { GoogleGenerativeAI } from '@google/generative-ai'

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY  // Changed from NEXT_PUBLIC_GEMINI_API_KEY
    this.isEnabled = !!this.apiKey
    
    console.log('🤖 [VS CODE] Gemini Service Initialization:', {
      apiKeyPresent: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0,
      isEnabled: this.isEnabled,
      timestamp: new Date().toISOString()
    })
    
    if (this.isEnabled) {
      this.genAI = new GoogleGenerativeAI(this.apiKey)
      // Use the latest model name for current API version
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash" })
      console.log('🤖 [VS CODE] Gemini model initialized with "gemini-2.5-flash"')
    } else {
      console.warn('⚠️ [VS CODE] Gemini API key not found in environment variables')
    }
  }

  // Test method to check API connectivity and available models
  async testConnection() {
    console.log('🧪 [VS CODE] Testing Gemini API connection...')
    
    if (!this.isEnabled) {
      console.error('❌ [VS CODE] Cannot test connection - API key not configured')
      return { success: false, error: 'API key not configured' }
    }

    try {
      // First, try to list available models
      const models = await this.listAvailableModels()
      
      if (models.length > 0) {
        console.log('✅ [VS CODE] API connection successful!')
        console.log('📋 [VS CODE] Available models for your API key:', models.map(m => ({
          name: m.name,
          displayName: m.displayName,
          supportedGenerationMethods: m.supportedGenerationMethods
        })))
        
        return { success: true, models }
      } else {
        console.warn('⚠️ [VS CODE] API connected but no models returned')
        return { success: false, error: 'No models available' }
      }
    } catch (error) {
      console.error('❌ [VS CODE] API connection test failed:', error)
      return { success: false, error: error.message }
    }
  }

  async generateContent(prompt) {
    if (!this.isEnabled) {
      console.warn('🤖 [VS CODE] Gemini API key not configured - using fallback response')
      return { 
        text: 'AI service not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment.',
        success: false
      }
    }

    try {
      console.log('🤖 [VS CODE] Gemini API Request:', { 
        promptLength: prompt.length,
        modelName: 'gemini-2.5-flash',
        apiKeyPresent: !!this.apiKey,
        timestamp: new Date().toISOString()
      })
      
      // Attempt to call the model
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      console.log('🤖 [VS CODE] Gemini API Response SUCCESS:', { 
        responseLength: text.length, 
        success: true,
        timestamp: new Date().toISOString()
      })
      
      return {
        text: text || 'No response generated',
        success: true
      }
    } catch (error) {
      console.error('🤖 [VS CODE] Gemini API Error DETAILED:', {
        errorMessage: error?.message || 'No error message',
        errorCode: error?.code || 'No error code',
        errorStatus: error?.status || 'No error status',
        errorName: error?.name || 'No error name',
        errorStack: error?.stack || 'No stack trace',
        stringifiedError: JSON.stringify(error, null, 2),
        timestamp: new Date().toISOString()
      })

      // Check if the error is related to an invalid model
      if (error.message && error.message.includes('models/gemini-2.5-flash is not found')) {
        console.warn('⚠️ [VS CODE] The specified model is not available. Fetching available models...')
        
        // Fetch the list of available models
        const availableModels = await this.listAvailableModels()
        console.log('📋 [VS CODE] Available Models:', availableModels)
        
        return {
          text: 'The requested model (gemini-2.5-flash) is not available. Check console for available models.',
          success: false
        }
      }
      
      // Provide helpful fallback messages based on error type
      let fallbackText = 'AI service temporarily unavailable'
      if (error.message?.includes('API_KEY')) {
        fallbackText = 'Invalid API key. Please check your Gemini API configuration.'
      } else if (error.message?.includes('QUOTA')) {
        fallbackText = 'API quota exceeded. Please try again later.'
      }
      if (error.message.includes('models/gemini-pro is not found')) {
        console.warn('⚠️ The specified model is not available. Fetching available models...')

        // Fetch the list of available models
        const availableModels = await this.listAvailableModels()
        console.log('Available Models:', availableModels)

        // Return a fallback response or rethrow the error
        fallbackText = 'The requested model is not available. Please try again later.'
      }
      
      return {
        text: fallbackText,
        success: false,
        error: error.message
      }
    }
  }

  // Add a method to list available models
  async listAvailableModels() {
    if (!this.isEnabled) {
      console.log('🤖 [VS CODE] Cannot list models - API key not configured')
      return []
    }

    try {
      console.log('📋 [VS CODE] Attempting to fetch available models...')
      
      // Use the correct method to get models
      const models = await this.genAI.listModels()
      
      console.log('📋 [VS CODE] Successfully fetched models:', {
        totalModels: models.length,
        modelNames: models.map(m => m.name),
        timestamp: new Date().toISOString()
      })
      
      return models
    } catch (error) {
      console.error('❌ [VS CODE] Failed to fetch available models:', {
        errorMessage: error.message,
        errorCode: error.code,
        errorStatus: error.status,
        timestamp: new Date().toISOString()
      })
      
      // Try alternative approach
      try {
        console.log('📋 [VS CODE] Trying alternative model listing method...')
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`)
        const data = await response.json()
        
        if (data.models) {
          console.log('📋 [VS CODE] Alternative method success:', {
            totalModels: data.models.length,
            modelNames: data.models.map(m => m.name),
            timestamp: new Date().toISOString()
          })
          return data.models
        }
      } catch (altError) {
        console.error('❌ [VS CODE] Alternative method also failed:', altError.message)
      }
      
      return []
    }
  }

  // Smart product description generator
  async generateProductDescription(productName, price, category = '') {
    if (!this.isEnabled) {
      return {
        text: `Quality ${productName} available at competitive pricing of ₹${price}. Perfect for your business needs.`,
        success: false
      }
    }

    const prompt = `Create a professional, concise product description for an inventory management system.
    
Product: ${productName}
Price: ₹${price}
Category: ${category}

Requirements:
- 2-3 sentences maximum
- Professional tone suitable for business inventory
- Highlight key features/benefits
- Include value proposition for the ₹${price} price point
- Focus on practical business use

Example format: "Professional [product] designed for [use case]. Features [key benefits] at competitive ₹${price} price point. Ideal for [target users/businesses]."

Return only the description, no additional text or formatting.`

    console.log('🤖 Generating product description for:', productName)
    const result = await this.generateContent(prompt)
    
    if (!result.success) {
      return {
        text: `Professional ${productName} designed for quality and reliability. Priced competitively at ₹${price}, offering excellent value for businesses. Ideal for inventory management and business operations.`,
        success: false
      }
    }
    
    return result
  }

  // Inventory insights and recommendations
  async analyzeInventory(inventoryData) {
    if (!this.isEnabled) {
      const totalItems = inventoryData.totalItems || 0
      const totalValue = inventoryData.totalValue || 0
      const lowStockItems = inventoryData.lowStockItems || 0
      
      return {
        text: `• You have ${totalItems} products worth ₹${totalValue?.toLocaleString()}\n• ${lowStockItems} items need restocking soon\n• Consider bulk purchasing for better margins\n• Monitor inventory levels regularly`,
        success: false
      }
    }

    const totalItems = inventoryData.totalItems || 0
    const totalValue = inventoryData.totalValue || 0
    const lowStockItems = inventoryData.lowStockItems || 0
    
    const prompt = `Analyze this business inventory and provide actionable insights:

Inventory Summary:
- Total Products: ${totalItems}
- Total Value: ₹${totalValue}
- Low Stock Items: ${lowStockItems}

Provide exactly 4 bullet points:
1. Overall inventory health assessment (1 sentence)
2. Top priority action (1 specific recommendation)
3. Business opportunity (1 growth suggestion)
4. Cost optimization tip (1 practical advice)

Format as bullet points with • symbol. Keep each point concise and actionable for a business owner.`

    console.log('🧠 Analyzing inventory:', { totalItems, totalValue, lowStockItems })
    const result = await this.generateContent(prompt)
    
    if (!result.success) {
      return {
        text: `• Your inventory has ${totalItems} items valued at ₹${totalValue?.toLocaleString()}\n• Priority: Restock ${lowStockItems} low-stock items\n• Opportunity: Diversify product range for growth\n• Tip: Consider bulk purchasing for better margins`,
        success: false
      }
    }
    
    return result
  }

  // Smart search query understanding
  async interpretSearchQuery(query, availableProducts = []) {
    if (!this.isEnabled) {
      return {
        text: `I understand you're looking for: "${query}". Try using the search bar above or apply relevant filters to find matching products.`,
        success: false
      }
    }

    const prompt = `Help interpret this search query for an inventory management system:

User Query: "${query}"
Available product types: ${availableProducts.slice(0, 10).join(', ')}

Provide helpful guidance:
1. What the user is likely looking for
2. Suggested search terms or filters to use
3. Alternative product suggestions if exact match not found

Keep response brief, helpful, and focused on improving their search experience.`

    console.log('🔍 Interpreting search query:', query)
    const result = await this.generateContent(prompt)
    
    if (!result.success) {
      // Smart fallback based on query analysis
      if (query.toLowerCase().includes('expensive') || query.toLowerCase().includes('high')) {
        return {
          text: `Looking for higher-priced items? Try filtering products above ₹1000 or use the price sorting feature.`,
          success: false
        }
      }
      if (query.toLowerCase().includes('cheap') || query.toLowerCase().includes('low')) {
        return {
          text: `Looking for budget items? Try filtering products under ₹500 or sort by lowest price first.`,
          success: false
        }
      }
      return {
        text: `I understand you're looking for: "${query}". Try using the search bar or apply relevant filters.`,
        success: false
      }
    }
    
    return result
  }

  // Business assistant for inventory questions
  async businessAssistant(question, inventoryContext = {}) {
    if (!this.isEnabled) {
      return {
        text: `AI assistant is not configured. For inventory help, try checking your stock levels, reviewing low-stock items, or analyzing your sales patterns.`,
        success: false
      }
    }

    // Prepare inventory items for analysis (sanitized for privacy)
    const inventoryItems = inventoryContext.inventoryItems || []
    const itemsList = inventoryItems.length > 0 
      ? inventoryItems.map(item => {
          // Sanitize sensitive data - only send essential info for analysis
          return `${item.itemName} - Price Range: ${this.getPriceRange(item.itemPrice)} (Stock Level: ${this.getStockLevel(item.stockQuantity)})`
        }).join('\n')
      : 'No specific items available'

    const prompt = `You are a business assistant for inventory management. Answer this question:

Question: "${question}"

Inventory Context:
- Total Items: ${inventoryContext.totalItems || 'Unknown'}
- Total Value Range: ${this.getValueRange(inventoryContext.totalValue)}
- Low Stock: ${inventoryContext.lowStockItems || 'Unknown'} items

Current Inventory Items (sanitized):
${itemsList}

Based on the product categories and general pricing patterns above, provide practical business advice. Focus on market domain analysis and growth suggestions. Keep response concise and actionable.`

    console.log('💬 Business assistant query:', question)
    const result = await this.generateContent(prompt)
    
    if (!result.success) {
      return {
        text: `For inventory management, consider: checking stock levels regularly, setting reorder points for popular items, and analyzing which products sell best. Need specific help? Try rephrasing your question.`,
        success: false
      }
    }
    
    return result
  }

  // Privacy helper methods - sanitize data before sending to external AI
  getPriceRange(price) {
    if (price < 100) return 'Under ₹100'
    if (price < 500) return '₹100-500'
    if (price < 1000) return '₹500-1000'
    if (price < 5000) return '₹1000-5000'
    return 'Above ₹5000'
  }

  getStockLevel(stock) {
    if (stock === 0) return 'Out of Stock'
    if (stock < 5) return 'Low Stock'
    if (stock < 20) return 'Medium Stock'
    return 'High Stock'
  }

  getValueRange(value) {
    if (!value) return 'Unknown'
    if (value < 10000) return 'Under ₹10K'
    if (value < 50000) return '₹10K-50K'
    if (value < 100000) return '₹50K-1L'
    return 'Above ₹1L'
  }

  // Price optimization suggestions
  async suggestPricing(productName, currentPrice, category = '') {
    if (!this.isEnabled) {
      return {
        text: `Consider researching competitor pricing for ${productName}. At ₹${currentPrice}, ensure you're covering costs while remaining competitive in the market.`,
        success: false
      }
    }

    const prompt = `Provide pricing analysis for inventory management:

Product: ${productName}
Current Price: ₹${currentPrice}
Category: ${category}

Provide:
1. Brief price competitiveness assessment
2. One specific pricing optimization suggestion  
3. Market positioning advice for Indian market

Keep advice practical and actionable for a business owner managing inventory.`

    console.log('💰 Pricing analysis for:', productName, '₹' + currentPrice)
    const result = await this.generateContent(prompt)
    
    if (!result.success) {
      const priceRange = currentPrice < 1000 ? 'budget-friendly' : currentPrice < 5000 ? 'mid-range' : 'premium'
      return {
        text: `Your ${productName} is positioned in the ${priceRange} segment at ₹${currentPrice}. Consider market research for competitive pricing and focus on value differentiation.`,
        success: false
      }
    }
    
    return result
  }
}

// Export singleton instance
export const geminiService = new GeminiService()

// Ready-to-use helper functions with analytics tracking
export const aiHelpers = {
  // Generate product description
  generateDescription: async (product) => {
    const result = await geminiService.generateProductDescription(
      product.itemName, 
      product.itemPrice, 
      product.category
    )
    
    // Track AI usage
    console.log('📊 AI Description Generated:', product.itemName)
    return result
  },

  // Get inventory insights
  getInsights: async (stats) => {
    const result = await geminiService.analyzeInventory(stats)
    
    // Track AI usage
    console.log('📊 AI Business Insight Generated:', stats.totalItems)
    return result
  },

  // Smart search help
  searchHelp: async (query, products) => {
    const productNames = products.map(p => p.itemName)
    const result = await geminiService.interpretSearchQuery(query, productNames)
    
    // Track AI usage
    console.log('📊 AI Search Help:', query)
    return result
  },

  // Ask business questions
  askAssistant: async (question, context) => {
    const result = await geminiService.businessAssistant(question, context)
    
    // Track AI usage
    console.log('📊 AI Chat Query:', question)
    return result
  },

  // Pricing advice
  pricingAdvice: async (product) => {
    const result = await geminiService.suggestPricing(
      product.itemName,
      product.itemPrice,
      product.category
    )
    
    // Track AI usage
    console.log('📊 AI Pricing Analysis:', product.itemName)
    return result
  }
}

// Track AI events for analytics
export const trackAIEvents = {
  // Track AI feature usage
  descriptionGenerated: (productName) => {
    console.log('📊 AI Description Generated:', productName)
    // Integration point for analytics
  },
  
  chatQuery: (query) => {
    console.log('📊 AI Chat Query:', query)
    // Integration point for analytics
  },
  
  businessInsight: (dataSize) => {
    console.log('📊 AI Business Insight:', dataSize)
    // Integration point for analytics
  }
}

// Usage examples:
/*
// 1. Auto-generate description when adding product
const description = await aiHelpers.generateDescription(newProduct)

// 2. Get inventory insights on dashboard
const insights = await aiHelpers.getInsights(inventoryStats)

// 3. Help with search
const searchHelp = await aiHelpers.searchHelp("cheap phones", allProducts)

// 4. Business assistant
const advice = await aiHelpers.askAssistant("What should I reorder?", inventoryContext)

// 5. Pricing optimization
const pricingTips = await aiHelpers.pricingAdvice(selectedProduct)
*/
