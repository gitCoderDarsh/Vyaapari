# Vyaapari - AI Inventory Management System

## Architecture Overview

**Vyaapari** is a Next.js 15 full-stack inventory management system with integrated AI business intelligence. Built with App Router, it features real-time analytics, natural language processing, and comprehensive CRUD operations.

### Key Components
- **Frontend**: Next.js 15 + React 19 + TailwindCSS (dark theme)
- **Backend**: NextAuth.js + Prisma ORM + PostgreSQL  
- **AI Layer**: Google Gemini API for business intelligence
- **Analytics**: Vercel Analytics + custom event tracking
- **UI Components**: Radix UI + Shadcn/ui with Lucide React icons

## Critical Integration Patterns

### AI Service Integration (`src/lib/gemini.js`)
```js
// Always check API availability before AI calls
if (!this.isEnabled) {
  return fallbackResponse
}

// All AI methods include error handling and fallbacks
try {
  const result = await geminiAPI.call()
  return result
} catch (error) {
  return fallbackResponse
}
```

### Authentication Flow
- **Session Provider**: Wrap all pages in `AuthSessionProvider` (layout.js)
- **API Protection**: Use `getServerSession(authOptions)` in API routes
- **Client Auth**: `useSession()` hook for component-level auth checks
- **Redirects**: Unauthenticated users → `/auth`, Authenticated → `/dashboard/inventory`

### State Management Patterns
```js
// Inventory page state structure (primary data pattern)
const [inventoryData, setInventoryData] = useState({
  items: [],
  totalItems: 0,
  totalValue: 0
})

// Modal pattern (used throughout)
const [showModal, setShowModal] = useState(false)
const [selectedId, setSelectedId] = useState(null)

// Toast notifications (consistent UX pattern)  
const [toast, setToast] = useState({ show: false, message: "", type: "success" })
```

### Form Validation Patterns
```js
// Standard form validation approach across all modals
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Client-side validation
  if (!formData.itemName.trim()) {
    showToast('Item name is required', 'error')
    return
  }
  
  if (formData.stockQuantity < 0) {
    showToast('Stock quantity cannot be negative', 'error')
    return
  }
  
  if (formData.itemPrice <= 0) {
    showToast('Item price must be greater than 0', 'error')
    return
  }
  
  setIsLoading(true)
  try {
    // API call logic
  } catch (error) {
    showToast('An error occurred', 'error')
  } finally {
    setIsLoading(false)
  }
}
```

## Development Workflows

### Environment Setup
```bash
# Required .env.local variables
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..." 
GOOGLE_CLIENT_SECRET="..."
NEXT_PUBLIC_GEMINI_API_KEY="..."  # Optional for AI features
NEXT_PUBLIC_ANALYTICS_PROVIDER="console"  # Options: console|google|mixpanel
```

### API Route Conventions
- **Authentication**: Always validate session first: `const session = await getServerSession(authOptions)`
- **Error Handling**: Return consistent `NextResponse.json({ error: "message" }, { status: code })`
- **User Scoping**: Filter data by `session.user.email` for multi-tenant isolation

### Component Communication
- **Modal Data Flow**: Parent passes `onSuccess` callback → Modal calls on success → Parent refreshes data
- **Analytics Integration**: Import `trackEvents` from `@/lib/analytics` and call appropriate event functions
- **AI Features**: Import `geminiService` from `@/lib/gemini` for AI capabilities

### Modal Component Pattern
```jsx
// Standard modal structure used across the application
export default function ExampleModal({ isOpen, onClose, onSuccess, showToast, itemId }) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({ /* initial state */ })
  
  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }
  
  // Reset form on close
  const handleClose = () => {
    resetForm()
    onClose()
  }
  
  // Modal structure with backdrop, form, and actions
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        {/* Form content */}
        {/* Action buttons */}
      </div>
    </div>
  )
}
```

## Critical File Dependencies

### Core Pages
- `src/app/dashboard/inventory/page.jsx` - Main inventory interface with search/filter/sort/AI
- `src/app/api/inventory/route.js` - Primary CRUD API with user scoping
- `src/app/api/auth/[...nextauth]/route.js` - Authentication configuration

### Reusable Patterns
- `src/components/inventory/AddItemModal.jsx` - Modal pattern with AI description generation
- `src/components/inventory/EditItemModal.jsx` - Edit modal with pre-populated data
- `src/components/dashboard/AIBusinessChatbot.jsx` - AI chat interface pattern
- `src/lib/analytics.js` - Multi-provider analytics abstraction

### Database Schema (Prisma)
- User → InventoryItem (one-to-many)
- Custom fields stored as JSON in `customFields` column
- NextAuth tables: User, Account, Session, VerificationToken

### UI Component Library
- **Button**: `src/components/ui/button.jsx` - Primary/secondary variants
- **Input**: `src/components/ui/input.jsx` - Dark theme styled inputs  
- **Label**: `src/components/ui/label.jsx` - Form labels
- **Tabs**: `src/components/ui/tabs.jsx` - Navigation tabs
- **Toast**: `src/components/ui/toast.jsx` - Notification system

## AI Feature Implementation

### Natural Language Processing
```js
// Pattern for AI query handling
const response = await geminiService.handleNaturalLanguageQuery(userQuery, inventoryData)
if (response.startsWith('SEARCH:')) {
  const searchTerms = response.replace('SEARCH:', '').trim()
  // Execute search in UI
}
```

### Business Intelligence
- **Product Descriptions**: Auto-generate via `geminiService.generateProductDescription()`
- **Business Insights**: Analyze inventory with `geminiService.getBusinessInsights()`
- **Pricing Analysis**: Get recommendations via `geminiService.getPricingRecommendation()`

### AI Integration Points
- **Add Item Modal**: AI description generation button
- **Inventory Page**: Natural language search via chatbot
- **Business Dashboard**: AI-powered insights and recommendations

## Styling Conventions

### TailwindCSS Dark Theme
```css
/* Standard dark theme classes used throughout */
.bg-gray-900     /* Primary background */
.bg-gray-800     /* Secondary background */
.bg-gray-700     /* Interactive elements */
.text-white      /* Primary text */
.text-gray-300   /* Secondary text */
.text-gray-400   /* Muted text */
.border-gray-700 /* Borders */
```

### Interactive States
```css
/* Button hover states */
.hover:bg-gray-600   /* Dark buttons */
.hover:bg-gray-100   /* Light buttons */

/* Focus states */
.focus:border-white  /* Input focus */
.focus:ring-2        /* Focus rings */
```

## Debugging & Development

### Common Issues
- **Duplicate src/ structure**: Work in root `src/` directory, ignore nested `src/src/`
- **AI Features**: Check console for "🤖", "🧠", "🔍" logs when AI is called
- **Analytics**: Look for "📊" logs for event tracking
- **Session Issues**: Verify NEXTAUTH_URL matches development URL
- **Modal Issues**: Ensure `isOpen` prop is properly managed and `onClose` resets state

### Key Commands
```bash
npm run dev          # Start development server
npx prisma studio    # View database in browser
npx prisma db push   # Apply schema changes
npm run build        # Production build test
```

### Testing Workflows
1. **Authentication**: Test login/logout flows and session persistence
2. **CRUD Operations**: Verify create, read, update, delete for inventory items
3. **AI Features**: Test with and without API key to ensure graceful degradation
4. **Responsive Design**: Test mobile/desktop layouts
5. **Form Validation**: Test both client and server-side validation

### Testing AI Features
1. Add `NEXT_PUBLIC_GEMINI_API_KEY` to `.env.local`
2. Test AI description generation in Add Item modal
3. Use chatbot for natural language queries
4. Check console logs for AI service calls and fallbacks

## Best Practices

### Code Organization
- Keep AI features in `src/lib/gemini.js` with consistent error handling
- Place reusable UI components in `src/components/ui/`
- Follow the established modal pattern for all dialogs
- Use the analytics tracking for user behavior insights

### Security
- Always validate user sessions in API routes
- Sanitize user inputs before database operations
- Use environment variables for sensitive data
- Implement proper CORS and rate limiting

### Performance
- Use React's built-in optimizations (useMemo, useCallback when needed)
- Implement proper loading states for better UX
- Optimize Prisma queries with proper indexing
- Cache API responses where appropriate

When modifying this system, maintain the established patterns for authentication, AI integration, analytics tracking, and component structure. All user data must be scoped by session, and AI features should gracefully degrade without API keys.
