# Order History Feature - Customer Tracking (No Login Required)

## Overview
Customers can now view their order history without creating an account. The system uses the customer's phone number as a unique identifier to retrieve their past orders.

## How It Works

### For Customers:
1. **Place an Order**: When ordering, customers provide their phone number
2. **View History**: Click "Mes commandes" in the header
3. **Enter Phone Number**: Input the same phone number used when ordering
4. **See All Orders**: View complete history with status and details

### Features:
- ✅ No account required
- ✅ Instant access to order history
- ✅ Real-time order status updates
- ✅ Mobile-friendly interface
- ✅ Privacy-focused (only need phone number)

## Technical Implementation

### Backend Changes:

#### 1. Database Schema (`database.sql`)
```sql
-- Added indexes for performance
CREATE INDEX idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX idx_orders_restaurant_created ON orders(restaurant_id, created_at DESC);
```

#### 2. New API Endpoint (`controllers/orderController.js`)
```javascript
// GET /api/orders/customer/history?phone=0600000000
const getCustomerOrders = async (req, res) => {
    const { phone } = req.query;
    // Returns all orders for a given phone number
};
```

#### 3. Routes (`routes/orderRoutes.js`)
```javascript
router.get('/customer/history', getCustomerOrders);
```

### Frontend Changes:

#### 1. New Service Method (`services/orderService.js`)
```javascript
getByPhone: async (phone) => {
    // Fetches orders from Supabase by customer phone
}
```

#### 2. New Page (`pages/client/OrderHistoryPage.jsx`)
- Search form with phone number input
- Order list with status badges
- Links to individual order details

#### 3. Updated Navigation (`layouts/ClientLayout.jsx`)
- Added "Mes commandes" button in header

## Usage

### Access Order History:
```
URL: http://localhost:5173/mes-commandes
```

### Example Flow:
1. Customer places order with phone: `06 12 34 56 78`
2. Customer clicks "Mes commandes" 
3. Enters phone number: `0612345678`
4. System displays all orders for that phone number

## Database Migration

Run this SQL on your Supabase database:

```bash
# Connect to your Supabase database
psql -h aws-1-eu-west-1.pooler.supabase.com -U postgres.poqcdohzkqhzjhantlmf -d postgres

# Or run via Supabase SQL Editor
```

Then execute:
```sql
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created ON orders(restaurant_id, created_at DESC);
```

## Security Considerations

### Privacy:
- Phone numbers are not verified, so anyone with a phone number can see orders
- This is intentional for convenience (no login required)
- Consider adding optional SMS verification for sensitive use cases

### Recommendations:
- Display only essential order information
- Don't show payment details in history
- Add rate limiting on the API endpoint if needed

## Future Enhancements (Optional):

1. **SMS Verification**: Send OTP to verify phone ownership
2. **Email Notifications**: Send order confirmations with tracking link
3. **QR Code**: Generate QR code on receipt for easy order lookup
4. **Export**: Allow customers to download order history as PDF

## Testing

### Test the Feature:

1. **Place Test Orders**:
   ```
   - Go to menu
   - Add items to cart
   - Checkout with phone: 0600000000
   ```

2. **View History**:
   ```
   - Click "Mes commandes"
   - Enter: 0600000000
   - Should see your test orders
   ```

3. **Check Individual Order**:
   ```
   - Click "Voir détails" on any order
   - Verify all information displays correctly
   ```

## Troubleshooting

### Orders Not Showing:
- Check phone number format (must match exactly)
- Verify database indexes are created
- Check browser console for errors

### API Errors:
- Ensure backend server is running
- Check CORS settings in `server.js`
- Verify Supabase connection

## Support

For issues or questions about this feature, check:
- Browser console for frontend errors
- Backend logs for API errors
- Supabase logs for database queries
