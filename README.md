# Fresh Squeeze - Juice Subscription Web Application

A modern, secure juice subscription platform built with React, Supabase, and best practices for authentication, state management, and user experience.

## Features

### 🔐 Authentication & Security
- **Supabase Auth Integration**: Email/password authentication with secure session management
- **Protected Routes**: Dashboard and Admin pages require authentication
- **Role-Based Access Control**: Admin panel restricted to users with admin role
- **User Profile Display**: Shows logged-in user info in navigation

### 📦 Subscription Plans
Five subscription options with discounted pricing:

1. **Trial Weekly** (15% OFF) - Try our service risk-free for 7 days
2. **Weekly Single Juice** (10% OFF) - Same juice daily for a week
3. **Weekly Variety Pack** (12% OFF) - Different juices every day
4. **Monthly Single Juice** (20% OFF) - Your favorite juice for a month
5. **Monthly Variety Pack** (25% OFF) - Maximum variety and savings ⭐ Most Popular

### ✅ Form Validation
- Phone number validation (10-digit Indian format)
- Email address validation
- Name validation (letters and spaces only)
- Address validation (minimum 10 characters)
- Date validation (no past dates)
- Real-time inline error messages

### 🎨 User Experience
- **Loading States**: Spinners during data fetching and form submissions
- **Toast Notifications**: Success/error feedback for all actions
- **Responsive Design**: Mobile-friendly interface
- **Smooth Navigation**: Multi-step subscription flow
- **Theme Toggle**: Light/dark mode support

### 📊 Admin Dashboard
- View all subscriptions across all users
- Analytics: Total revenue, active subscriptions, customer count
- Upcoming deliveries (next 7 days)
- Juice popularity rankings
- Search and filter capabilities

## Tech Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL + Auth)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Validation**: Custom utility functions
- **Styling**: CSS with custom properties (CSS variables)

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable components
│   │   ├── LoadingSpinner.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Toast.jsx
│   ├── layout/          # Layout components
│   │   └── Navbar.jsx
│   └── features/        # Feature-specific components
│       └── JuiceCard.jsx
├── pages/               # Page components
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Subscribe.jsx
│   ├── Dashboard.jsx
│   └── Admin.jsx
├── context/             # React Context providers
│   ├── AuthContext.jsx  # Authentication state
│   └── AppContext.jsx   # Application state
├── hooks/               # Custom hooks (future)
├── lib/                 # Utilities and configurations
│   └── supabase.js
├── styles/              # CSS files
│   ├── Auth.css
│   ├── JuiceCard.css
│   ├── LoadingSpinner.css
│   ├── Navbar.css
│   ├── Subscribe.css
│   └── Toast.css
├── utils/               # Helper functions
│   └── validation.js
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Global styles
```

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Supabase account

### 1. Clone the Repository
```bash
git clone <repository-url>
cd juice-subs
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Supabase

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your project URL and anon key

#### Run Database Setup
Execute the SQL in `supabase_setup.sql` in your Supabase SQL Editor. This will:
- Create `juices` table with initial juice data
- Create `subscriptions` table with user_id foreign key
- Set up Row Level Security (RLS) policies
- Create indexes for performance

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Creating Admin Users

Admin users can view all subscriptions and access the admin dashboard. To create an admin user:

1. Register a new user through the app
2. In Supabase Dashboard, go to Authentication > Users
3. Find your user and edit their metadata
4. Add `"role": "admin"` to the `user_metadata` JSON field:
```json
{
  "name": "Admin User",
  "role": "admin"
}
```

## Usage

### For Customers

1. **Register/Login**: Create an account or sign in
2. **Choose a Plan**: Select from 5 subscription options
3. **Select Juice(s)**: Pick your favorite juice (or get variety pack)
4. **Enter Details**: Provide delivery information with validation
5. **Confirm**: Review and submit your subscription
6. **Manage**: View and cancel subscriptions in your dashboard

### For Admins

1. **Login** with admin account
2. **Access Admin Panel**: Click "Admin" in navigation
3. **View Analytics**: See revenue, subscriptions, and trends
4. **Monitor Deliveries**: Check upcoming deliveries for the week
5. **Track Popularity**: View which juices are most popular

## Security Features

- ✅ Supabase Auth with secure session management
- ✅ Protected routes with authentication checks
- ✅ Role-based access control for admin features
- ✅ Row Level Security (RLS) on database tables
- ✅ User-specific data isolation
- ✅ No sensitive data in localStorage
- ✅ Environment variables for API keys

## Form Validation Rules

- **Email**: Valid email format required
- **Password**: Minimum 6 characters
- **Name**: 2+ characters, letters and spaces only
- **Phone**: 10-digit number starting with 6-9 (Indian format)
- **Address**: Minimum 10 characters
- **Start Date**: Cannot be in the past

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Database Schema

### `juices` Table
- `id`: Primary key
- `name`: Juice name
- `description`: Ingredients
- `price`: Price in rupees
- `category`: detox/energy/immunity/refresh/protein
- `image`: Emoji icon
- `calories`: Calorie count
- `size`: Serving size (e.g., "500ml")

### `subscriptions` Table
- `id`: Primary key
- `user_id`: Foreign key to auth.users
- `juice_id`: Foreign key to juices
- `plan_id`: Subscription plan identifier
- `quantity`: Juices per day
- `delivery_time`: morning/afternoon/evening
- `customer_name`: Delivery name
- `customer_phone`: Contact number
- `customer_address`: Delivery address
- `start_date`: Subscription start date
- `total`: Total cost
- `status`: active/cancelled

## Future Enhancements

- [ ] Payment integration
- [ ] Order tracking
- [ ] Email notifications
- [ ] Subscription pause/resume
- [ ] Referral program
- [ ] Customer reviews and ratings
- [ ] Nutrition information expanded
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

---

Built with ❤️ using React and Supabase
