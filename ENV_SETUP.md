# ENV Setup

## Backend (`backend/.env`)

```env
# Server
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# PostgreSQL
DB_NAME=smart_waste_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
DB_DIALECT=postgres

# MongoDB (IoT sensor data)
MONGODB_URI=mongodb://localhost:27017/smart_waste_iot

# JWT Auth
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=refresh_secret
REFRESH_TOKEN_EXPIRE=30d

# Logging
LOG_LEVEL=debug
```

## Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## Production Example

### Backend
```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
DB_NAME=smart_waste_db
DB_USER=prod_user
DB_PASSWORD=strong_password_here
DB_HOST=your-db-host.com
DB_PORT=5432
DB_DIALECT=postgres
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart_waste_iot
JWT_SECRET=generate_a_64_char_random_string
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=generate_another_64_char_random_string
REFRESH_TOKEN_EXPIRE=30d
LOG_LEVEL=error
```

### Frontend
```env
VITE_API_URL=https://api.yourdomain.com/api
```
