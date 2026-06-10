# Sales & Inventory Management System

A comprehensive, professional inventory and sales management system built with React JS, Tailwind CSS, Laravel PHP, and REST API.

## Features

### ✅ Authentication
- Admin login system
- JWT token-based authentication
- Secure session management

### 📊 Dashboard
- KPI metrics (Today & This Month)
- Sales, Purchases, Gross Profit tracking
- Stock value overview
- Top 5 items sold chart
- Low-stock alerts
- Quick action buttons

### 👥 Contacts Management
- **Customers** - Create, read, update, delete
- **Suppliers** - Create, read, update, delete
- Contact fields: name, phone, email, address, note, active status
- Search and filter functionality

### 📦 Items/Products Management
- CRUD operations for items
- Item fields: name, SKU, category, cost price, sell price, stock on hand, reorder level
- Automatic stock level validation
- Low-stock indicators
- Moving average cost tracking

### 🛒 Purchase Management
- Create purchases from suppliers
- Add multiple line items with quantities and costs
- Automatic stock updates
- Purchase history and filtering
- Delete purchases with stock reversal

### 💰 Sales Management
- Create sales transactions
- Add customers (optional)
- Multiple line items per sale
- Stock validation protection
- Prevent negative stock (configurable)
- Sales history and tracking

### 📈 Reports
- **Item Sales Report** - By date range, qty, revenue
- **Item Purchase Report** - By date range, qty, cost
- **Profit & Loss Report** - Using moving average cost
- **Stock Report** - Current stock, stock value, low-stock items
- Export to CSV (optional)

### ⚙️ Settings
- Business name customization
- Currency configuration
- Stock protection (block negative stock on/off)
- Low stock threshold default
- Date format settings
- Data reset option (danger zone)

### 🌓 UI/UX
- Light and Dark Mode support
- Professional, modern design
- Responsive layout (mobile, tablet, desktop)
- Tailwind CSS styling
- Smooth transitions and animations

## Project Structure

```
sale_prom/
├── frontend/                 # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React Context
│   │   ├── utils/           # Utility functions
│   │   ├── hooks/           # Custom hooks
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── backend/                  # Laravel Backend
    ├── app/
    │   ├── Http/Controllers/
    │   ├── Models/           # Database Models
    ├── database/
    │   └── migrations/       # Database Migrations
    ├── routes/
    │   └── api.php          # API Routes
    ├── config/
    ├── composer.json
    └── .env

```

## Installation & Setup

### Backend (Laravel)

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
composer install
```

3. **Environment configuration**
```bash
cp .env.example .env
```

Edit `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=inventory_db
DB_USERNAME=root
DB_PASSWORD=

JWT_SECRET=your-secret-key
```

4. **Generate application key**
```bash
php artisan key:generate
```

5. **Run migrations**
```bash
php artisan migrate
```

6. **Seed demo data** (optional)
```bash
php artisan db:seed
```

7. **Start the server**
```bash
php artisan serve
```

The backend will run on `http://localhost:8000`

### Frontend (React)

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Create .env file**
```env
VITE_API_URL=http://localhost:8000/api
```

4. **Start development server**
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` or `http://localhost:3000`

## API Documentation

### Authentication
- **POST** `/api/auth/login` - Login with email and password
- **POST** `/api/auth/logout` - Logout (requires auth)

### Contacts
- **GET** `/api/contacts?type=customer` - Get all contacts
- **GET** `/api/contacts/{id}` - Get single contact
- **POST** `/api/contacts` - Create contact
- **PUT** `/api/contacts/{id}` - Update contact
- **DELETE** `/api/contacts/{id}` - Delete contact

### Items
- **GET** `/api/items` - Get all items
- **GET** `/api/items/{id}` - Get single item
- **POST** `/api/items` - Create item
- **PUT** `/api/items/{id}` - Update item
- **DELETE** `/api/items/{id}` - Delete item
- **GET** `/api/items/{id}/stock` - Check stock availability

### Purchases
- **GET** `/api/purchases` - Get all purchases
- **POST** `/api/purchases` - Create purchase with items
- **DELETE** `/api/purchases/{id}` - Delete purchase

### Sales
- **GET** `/api/sales` - Get all sales
- **POST** `/api/sales` - Create sale with items
- **DELETE** `/api/sales/{id}` - Delete sale

### Reports
- **GET** `/api/reports/dashboard` - Dashboard metrics
- **GET** `/api/reports/item-sales` - Item sales report
- **GET** `/api/reports/item-purchase` - Item purchase report
- **GET** `/api/reports/profit-loss` - Profit & loss report
- **GET** `/api/reports/stock` - Stock report

### Settings
- **GET** `/api/settings` - Get settings
- **PUT** `/api/settings` - Update settings

## Database Schema

### Tables
- `users` - Admin users
- `contacts` - Customers and Suppliers
- `items` - Product inventory
- `purchases` - Purchase orders from suppliers
- `purchase_items` - Line items for purchases
- `sales` - Sales transactions
- `sale_items` - Line items for sales
- `settings` - System configuration

## Technologies Used

### Frontend
- **React 18.2** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - API requests
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Zustand** - State management

### Backend
- **Laravel 10** - Framework
- **PHP 8.1+** - Language
- **MySQL** - Database
- **JWT Auth** - Authentication
- **Sanctum/JWT** - API tokens

## Default Credentials

```
Email: admin@example.com
Password: password
```

## Key Features Implementation

### Stock Management
- Automatic stock updates on purchases and sales
- Moving average cost calculation
- Low-stock threshold alerts
- Negative stock prevention (configurable)

### Financial Tracking
- Real-time P&L calculation
- Revenue and COGS tracking
- Average cost costing method
- Profit margin calculation

### Data Integrity
- Transaction-based operations
- Stock reversal on deletion
- Referential integrity constraints
- Audit trail via timestamps

## Future Enhancements

- [ ] CSV export functionality
- [ ] Barcode scanning
- [ ] Multi-location inventory
- [ ] Role-based access control (RBAC)
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Advanced reporting with filters
- [ ] Data import/export
- [ ] Mobile app companion
- [ ] Inventory adjustments
- [ ] Serial number tracking
- [ ] Supplier management enhancements

## Security Notes

- All API endpoints require JWT authentication
- CORS is configured for localhost development
- Update CORS and API URLs for production
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization
- Regular security audits recommended

## Support & Contribution

For issues or contributions, please refer to the project repository.

## License

This project is licensed under the MIT License.

---

**Created with ❤️ for inventory management**
#   I n v e n t o r y - P r o  
 