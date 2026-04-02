## Quick Start Guide

### Step 1: Backend Setup (Laravel)

```bash
cd backend

# Install dependencies
composer install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate

# Start Laravel server
php artisan serve
```

The API will be available at: `http://localhost:8000`

### Step 2: Frontend Setup (React)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:5173` or `http://localhost:3000`

### Step 3: Create Admin User

Using Laravel Tinker:

```bash
php artisan tinker
```

```php
User::create([
    'name' => 'Admin',
    'email' => 'admin@example.com',
    'password' => bcrypt('password'),
    'role' => 'admin'
]);
```

### Step 4: Login

- Open browser to `http://localhost:5173`
- Email: `admin@example.com`
- Password: `password`

## Development Workflow

### Running in Development

**Terminal 1 - Backend:**
```bash
cd backend
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend Build:**
```bash
cd frontend
npm run build
```

**Backend Optimization:**
```bash
cd backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## File Naming Conventions

- **Controllers**: `{Resource}Controller.php`
- **Models**: `{Resource}.php` (singular)
- **Migrations**: `YYYY_MM_DD_HHMMSS_create_{table}_table.php`
- **API Routes**: RESTful naming
- **React Components**: `{ComponentName}.jsx` (PascalCase)
- **Styling**: Tailwind CSS with custom classes in `index.css`

## Database Management

### View Database
- Open phpMyAdmin: `http://localhost/phpmyadmin`
- Database name: `inventory_db`

### Reset Database
```bash
php artisan migrate:fresh --seed
```

### View Database Structure
```bash
php artisan db:table {table_name}
```

## Troubleshooting

### CORS Errors
- Check CORS configuration in `backend/config/cors.php`
- Ensure frontend URL is in allowed origins

### Port Already in Use
- Backend: `php artisan serve --port=8001`
- Frontend: `npm run dev -- --port=3001`

### Database Connection Error
- Verify MySQL is running
- Check `.env` database credentials
- Ensure database `inventory_db` exists

### Missing Dependencies
- PHP: `composer install`
- Node: `npm install`

## API Testing

### Using Postman
1. Import API endpoints from `backend/routes/api.php`
2. Set Authorization header: `Bearer {token}`
3. Test endpoints

### Using cURL
```bash
# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'

# Get Items (with token)
curl -X GET http://localhost:8000/api/items \
  -H "Authorization: Bearer {token}"
```

## Performance Tips

1. **Disable debug mode in production** - Set `APP_DEBUG=false`
2. **Cache configuration** - Run config cache in production
3. **Optimize database queries** - Use eager loading with `with()`
4. **Frontend optimization** - Minify and code split
5. **CDN usage** - Serve static assets from CDN

## Next Steps

1. ✅ Complete other pages (Purchases, Sales, Reports, Settings)
2. ✅ Add CSV export functionality
3. ✅ Implement advanced filtering and search
4. ✅ Add user roles and permissions
5. ✅ Setup unit and integration tests
6. ✅ Deploy to production

