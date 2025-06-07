# Oromelo Gold Pawn

A modern full-stack web application for managing gold transactions, built with React, Tailwind CSS, and Supabase. The platform allows users to buy, sell or pawn their gold items with secure authentication, while admin capabilities provide comprehensive transaction management, real-time monitoring, and user profile management. It also features a user-friendly, interactive interface with dark mode support.

https://oromelo.ph

## Features

### User Authentication & Security

- Secure user registration and login
- Google authentication integration
- Password reset functionality with email verification
- Protected routes for admin and user-specific pages

### Theme & UI

- Dark mode as default theme
- Theme toggle component
- Responsive design optimized for mobile
- Interactive gold particle effects
- Gold shimmer animation on homepage
- Amber/yellow color scheme for consistency
- Mobile-optimized text alignment for better readability
- Smooth scroll animations for navigation

### Item Management

- Sell item submission with detailed information
- Pawn item submission with valuation information
- Item editing and deletion
- Status management (pending, approved, rejected, sold, pawned)
- Image upload support with preview
- Advanced filtering system (category, type, price, gold type, karat, color, weight)
- Meeting scheduling for item viewing
- Transaction history tracking

### Admin Features

- Dashboard overview of all items
- Item approval/rejection/deletion workflow
- Transaction management
- User management
- Advanced filtering and sorting
- Multiple admin email notifications
- **Listings Management**: Admin dashboard for managing all listings
- **Inquiry Management**: View and respond to user inquiries about listings
- **Featured Control**: Monitor popular items that appear in the Featured section

### Core Features

- Real-time gold price tracking
- Transaction history and management
- User profile management with avatar upload
- Contact form integration with Resend
- New listing notification email to admin integration with Resend
- FAQ section with expandable answers
- Responsive image gallery for items
- Status badges for item states
- Pagination for item listings
- Mobile-responsive design

### Gold Listings Feature

- **Listings Browse Page**: View all available gold items with advanced filtering options
- **Interactive Listing Detail**: Individual listing pages with detailed information
- **Lightbox Gallery**: Full-screen image viewer with navigation controls on listing detail pages
- **Featured Items Section**: Homepage showcase of 3 most popular items based on like counts
- **Social Features**: Like and comment on listings to increase engagement
- **User Inquiries**: Send direct inquiries about specific listings to sellers

### Technical Features

- Supabase integration for database and authentication
- Resend integration for contact form
- Multiple API integrations (Metal Price, Alpha Vantage)
- Custom hooks for state management
- Context providers for authentication and theme
- Protected routing system
  - **Item Review**: Approve or reject submitted items
  - **Transaction Management**: Process pawn transactions with flexible terms
  - **Status Updates**: Change item status (approve, reject, mark as sold or pawned)
  - **Item Counts**: View counts of items by status (pending, approved, sold, pawned, rejected)
  - **Pagination**: Navigate through large item collections efficiently
- **User Dashboard**:
  - **My Items**: View and manage personal submitted items
  - **Edit Items**: Update item information and photos
  - **Profile Management**: Update personal information and avatar
- **User Interface**:
  - **Dark Mode Support**: Default dark theme with toggle option
  - **Responsive Design**: Fully functional on mobile, tablet, and desktop devices
  - **Visual Effects**: Gold shimmer effect on homepage and interactive UI elements
  - **Mobile Optimization**: Center-aligned text on small screens for better readability
- **Communication**:
  - **Contact Form**: Send messages directly to admin team via EmailJS
  - **Email Notifications**: Automatic notifications for item listings and status changes
- **Gold Price Tracker**: Live tracking of gold prices in USD and PHP

## Tech Stack

- **Frontend**:
  - React 18.2.0
  - React Router DOM 6.22.0
  - Tailwind CSS 3.3.3 for styling
  - Heroicons 2.2.0 for UI icons
  - React tsParticles 2.12.2 for interactive backgrounds
- **Backend**:
  - Supabase for Authentication, Database, and Storage
  - PostgreSQL database (managed by Supabase)
  - Row Level Security (RLS) for data protection
- **Email Services**:
  - Resend for transactional emails
  - Custom email templates with React Email
- **External APIs**:
  - Metal Price API - For real-time gold prices
  - Alpha Vantage API - For financial data
  - Open Exchange Rate API - For currency conversion
- **Build & Development Tools**:
  - Vite 5.0.0 for fast development and optimized builds
  - ESLint and Prettier for code quality
  - PostCSS for CSS processing
  - Netlify for deployment and serverless functions

## Database Schema

The application uses several tables in Supabase to manage all its data. Here's a detailed breakdown of each table and its columns:

### 1. Profiles Table

Stores user profile information synchronized with Supabase Auth.

| Column Name | Data Type | Description                     | Constraints   |
| ----------- | --------- | ------------------------------- | ------------- |
| id          | UUID      | User ID (references auth.users) | PRIMARY KEY   |
| email       | TEXT      | User's email address            | NOT NULL      |
| full_name   | TEXT      | User's full name                |               |
| avatar_url  | TEXT      | URL to user's profile picture   |               |
| updated_at  | TIMESTAMP | Last update timestamp           | DEFAULT now() |
| created_at  | TIMESTAMP | Creation timestamp              | DEFAULT now() |

### 2. Items Table

Main table for storing both sell and pawn items.

| Column Name       | Data Type | Description                                | Constraints       |
| ----------------- | --------- | ------------------------------------------ | ----------------- |
| id                | UUID      | Unique item ID                             | PRIMARY KEY       |
| user_id           | UUID      | Owner of the item (references profiles.id) | NOT NULL          |
| title             | TEXT      | Item title                                 | NOT NULL          |
| category          | TEXT      | Item category                              | NOT NULL          |
| gold_type         | TEXT      | Color of gold                              |                   |
| gold_origin       | TEXT      | Origin of gold                             |                   |
| purity            | TEXT      | Karat value of gold                        |                   |
| weight            | DECIMAL   | Weight of the item                         |                   |
| item_type         | TEXT      | Type of listing ('sell' or 'pawn')         | NOT NULL          |
| status            | TEXT      | Current status of item                     | DEFAULT 'pending' |
| amount            | DECIMAL   | Price estimate                             |                   |
| details           | TEXT      | Item description                           |                   |
| brand             | TEXT      | Item brand                                 |                   |
| image_url         | TEXT      | Main image URL                             |                   |
| additional_images | TEXT[]    | Array of additional image URLs             |                   |
| created_at        | TIMESTAMP | Creation timestamp                         | DEFAULT now()     |
| updated_at        | TIMESTAMP | Last update timestamp                      | DEFAULT now()     |

### 3. Sell Requests Table

Stores information about sell requests.

| Column Name    | Data Type | Description                              | Constraints   |
| -------------- | --------- | ---------------------------------------- | ------------- |
| id             | UUID      | Unique request ID                        | PRIMARY KEY   |
| item_id        | UUID      | Referenced item ID (references items.id) | NOT NULL      |
| full_name      | TEXT      | Seller's full name                       | NOT NULL      |
| contact_number | TEXT      | Seller's contact number                  | NOT NULL      |
| email          | TEXT      | Seller's email address                   | NOT NULL      |
| created_at     | TIMESTAMP | Creation timestamp                       | DEFAULT now() |
| updated_at     | TIMESTAMP | Last update timestamp                    | DEFAULT now() |

### 4. Pawn Requests Table

Stores information about pawn requests and meeting details.

| Column Name    | Data Type | Description                              | Constraints   |
| -------------- | --------- | ---------------------------------------- | ------------- |
| id             | UUID      | Unique request ID                        | PRIMARY KEY   |
| item_id        | UUID      | Referenced item ID (references items.id) | NOT NULL      |
| brand          | TEXT      | Item brand                               |               |
| details        | TEXT      | Additional item details                  |               |
| pawn_price     | DECIMAL   | Requested pawn price                     |               |
| full_name      | TEXT      | Customer's full name                     | NOT NULL      |
| contact_number | TEXT      | Customer's contact number                | NOT NULL      |
| email          | TEXT      | Customer's email address                 | NOT NULL      |
| address        | TEXT      | Customer's address                       |               |
| meeting_date_1 | TIMESTAMP | First preferred meeting date             | NOT NULL      |
| meeting_date_2 | TIMESTAMP | Second preferred meeting date            |               |
| meeting_date_3 | TIMESTAMP | Third preferred meeting date             |               |
| meeting_place  | TEXT      | Preferred meeting location               |               |
| meeting_time   | TEXT      | Preferred meeting time                   |               |
| created_at     | TIMESTAMP | Creation timestamp                       | DEFAULT now() |
| updated_at     | TIMESTAMP | Last update timestamp                    | DEFAULT now() |

### 5. Transactions Table

Records all transactions (sales and pawns).

| Column Name      | Data Type | Description                              | Constraints   |
| ---------------- | --------- | ---------------------------------------- | ------------- |
| id               | UUID      | Unique transaction ID                    | PRIMARY KEY   |
| item_id          | UUID      | Referenced item ID (references items.id) |               |
| amount           | DECIMAL   | Transaction amount                       | NOT NULL      |
| transaction_date | TIMESTAMP | Date of transaction                      | DEFAULT now() |
| transaction_type | TEXT      | Type of transaction ('sell' or 'pawn')   | NOT NULL      |
| created_at       | TIMESTAMP | Creation timestamp                       | DEFAULT now() |
| updated_at       | TIMESTAMP | Last update timestamp                    | DEFAULT now() |

### 6. Listings Table

Stores the gold item listings for the marketplace.

| Column Name | Data Type | Description               | Constraints      |
| ----------- | --------- | ------------------------- | ---------------- |
| id          | UUID      | Unique listing ID         | PRIMARY KEY      |
| user_id     | UUID      | Owner of the listing      | NOT NULL         |
| title       | TEXT      | Listing title             | NOT NULL         |
| description | TEXT      | Detailed description      |                  |
| price       | DECIMAL   | Item price                | NOT NULL         |
| category    | TEXT      | Item category             | NOT NULL         |
| purity      | TEXT      | Gold purity (karat)       |                  |
| weight      | DECIMAL   | Weight in grams           |                  |
| gold_color  | TEXT      | Color of gold             |                  |
| gold_origin | TEXT      | Origin of gold            |                  |
| images      | TEXT[]    | Array of image URLs       |                  |
| status      | TEXT      | Current status of listing | DEFAULT 'active' |
| created_at  | TIMESTAMP | Creation timestamp        | DEFAULT now()    |
| updated_at  | TIMESTAMP | Last update timestamp     | DEFAULT now()    |

### 7. Listing Likes Table

Tracking likes on listings to determine popularity.

| Column Name | Data Type | Description                                  | Constraints   |
| ----------- | --------- | -------------------------------------------- | ------------- |
| id          | UUID      | Unique like ID                               | PRIMARY KEY   |
| user_id     | UUID      | User who liked the listing                   | NOT NULL      |
| listing_id  | UUID      | ID of liked listing (references listings.id) | NOT NULL      |
| created_at  | TIMESTAMP | Creation timestamp                           | DEFAULT now() |

### 8. Listing Comments Table

Stores user comments on listings.

| Column Name | Data Type | Description                                      | Constraints   |
| ----------- | --------- | ------------------------------------------------ | ------------- |
| id          | UUID      | Unique comment ID                                | PRIMARY KEY   |
| user_id     | UUID      | User who made the comment                        | NOT NULL      |
| listing_id  | UUID      | ID of commented listing (references listings.id) | NOT NULL      |
| comment     | TEXT      | Comment text                                     | NOT NULL      |
| created_at  | TIMESTAMP | Creation timestamp                               | DEFAULT now() |
| updated_at  | TIMESTAMP | Last update timestamp                            | DEFAULT now() |

### 9. Listing Inquiries Table

Stores user inquiries about specific listings.

| Column Name    | Data Type | Description                                     | Constraints   |
| -------------- | --------- | ----------------------------------------------- | ------------- |
| id             | UUID      | Unique inquiry ID                               | PRIMARY KEY   |
| user_id        | UUID      | User who made the inquiry                       | NOT NULL      |
| listing_id     | UUID      | ID of inquired listing (references listings.id) | NOT NULL      |
| message        | TEXT      | Inquiry message                                 | NOT NULL      |
| contact_number | TEXT      | Contact number of inquirer                      |               |
| status         | TEXT      | Status of inquiry (new, read, responded)        | DEFAULT 'new' |
| created_at     | TIMESTAMP | Creation timestamp                              | DEFAULT now() |
| updated_at     | TIMESTAMP | Last update timestamp                           | DEFAULT now() |

## Configuration

### Admin Email Configuration

The application supports multiple admin emails for notifications and management. The following emails are configured as admins:

- shredraldz@gmail.com
- admin@oromelo.ph
- ermpolicarpio@gmail.com
- raldz18@yahoo.com

## External APIs Setup

This application uses several external APIs to fetch real-time data and handle email communications:

### 1. Metal Price API

Used to fetch current gold prices. Get your API key from [https://metalpriceapi.com/](https://metalpriceapi.com/).

Add to your `.env` file:

```
VITE_METAL_PRICE_API_KEY=your-metal-price-api-key
```

### 2. Alpha Vantage API

Used for financial data and commodities pricing. Get your API key from [https://www.alphavantage.co/](https://www.alphavantage.co/).

Add to your `.env` file:

```
VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
```

### 3. Open Exchange Rate API

Used for currency conversion (PHP to USD). No API key required as the application uses their free public endpoint.

### 4. Resend API

Used for sending transactional emails. Get your API key from [https://resend.com/](https://resend.com/).

Add to your `.env` file:

```
VITE_RESEND_API_KEY=your-resend-api-key
VITE_ADMIN_EMAILS=shredraldz@gmail.com,admin@oromelo.ph,ermpolicarpio@gmail.com,raldz18@yahoo.com
```

### 5. EmailJS API (Legacy)

Used for contact form emails. Get your credentials from [https://www.emailjs.com/](https://www.emailjs.com/).

Add to your `.env` file:

```
VITE_EMAILJS_SERVICE_ID=your-service-id
VITE_EMAILJS_PUBLIC_KEY=your-public-key
```

> **Note**: The application is migrating from EmailJS to Resend for email functionality. New features should use Resend, while legacy code might still reference EmailJS.

## Supabase Implementation

To set up the Supabase backend for this application, follow these steps:

### 1. Create a Supabase Project

1. Sign up or log in at [https://supabase.com](https://supabase.com)
2. Create a new project and note your project URL and anon/public key
3. Set up a strong database password

### 2. Database Tables Setup

Create the tables using the SQL schema provided in the [Database Schema](#database-schema) section above.

### 3. Set Up Row Level Security (RLS)

Enable Row Level Security and create policies for each table to ensure proper access control.

### 3. Set Up Row Level Security (RLS)

Enable Row Level Security and create policies for each table:

```sql
-- Enable RLS on all tables
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sell_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pawn_requests" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "transactions" ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Anyone can view profiles" ON "profiles"
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON "profiles"
  FOR UPDATE USING (auth.uid() = id);

-- ITEMS POLICIES
CREATE POLICY "Users can view own items" ON "items"
  FOR SELECT USING (auth.uid() = user_id OR auth.email() = 'shredraldz@gmail.com');

CREATE POLICY "Users can insert own items" ON "items"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending items" ON "items"
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admin can update any item" ON "items"
  FOR UPDATE USING (auth.email() = 'shredraldz@gmail.com');

CREATE POLICY "Users can delete own pending items" ON "items"
  FOR DELETE USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admin can delete any item" ON "items"
  FOR DELETE USING (auth.email() = 'shredraldz@gmail.com');

-- Create similar policies for sell_requests, pawn_requests, and transactions tables
```

### 4. Create Storage Bucket

Set up storage for item images:

```sql
-- Create storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gold-items-images', 'gold-items-images', TRUE);

-- Set up access policies
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'gold-items-images');

CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'gold-items-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'gold-items-images' AND (owner = auth.uid() OR auth.email() = 'shredraldz@gmail.com'));

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (bucket_id = 'gold-items-images' AND (owner = auth.uid() OR auth.email() = 'shredraldz@gmail.com'));
```

## Additional Database Tables Setup

Create the additional marketplace-related tables:

```sql
-- Listings Table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  category TEXT NOT NULL,
  purity TEXT,
  weight DECIMAL,
  gold_color TEXT,
  gold_origin TEXT,
  images TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Listing Likes Table
CREATE TABLE listing_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  listing_id UUID REFERENCES listings(id) NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Listing Comments Table
CREATE TABLE listing_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  listing_id UUID REFERENCES listings(id) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Listing Inquiries Table
CREATE TABLE listing_inquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  listing_id UUID REFERENCES listings(id) NOT NULL,
  message TEXT NOT NULL,
  contact_number TEXT,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## Additional Row Level Security (RLS)

Enable Row Level Security on new tables:

```sql
-- Enable RLS on new tables
ALTER TABLE "listings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listing_likes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listing_comments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "listing_inquiries" ENABLE ROW LEVEL SECURITY;

-- LISTINGS POLICIES
CREATE POLICY "Anyone can view active listings" ON "listings"
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view own inactive listings" ON "listings"
  FOR SELECT USING (auth.uid() = user_id AND status != 'active');

CREATE POLICY "Admin can view all listings" ON "listings"
  FOR SELECT USING (auth.email() IN ('shredraldz@gmail.com', 'admin@oromelo.ph', 'ermpolicarpio@gmail.com', 'raldz18@yahoo.com'));

CREATE POLICY "Users can insert own listings" ON "listings"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings" ON "listings"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admin can update any listing" ON "listings"
  FOR UPDATE USING (auth.email() IN ('shredraldz@gmail.com', 'admin@oromelo.ph', 'ermpolicarpio@gmail.com', 'raldz18@yahoo.com'));

CREATE POLICY "Users can delete own listings" ON "listings"
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admin can delete any listing" ON "listings"
  FOR DELETE USING (auth.email() IN ('shredraldz@gmail.com', 'admin@oromelo.ph', 'ermpolicarpio@gmail.com', 'raldz18@yahoo.com'));

-- LISTING LIKES POLICIES
CREATE POLICY "Anyone can view listing likes" ON "listing_likes"
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes" ON "listing_likes"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON "listing_likes"
  FOR DELETE USING (auth.uid() = user_id);

-- LISTING COMMENTS POLICIES
CREATE POLICY "Anyone can view comments" ON "listing_comments"
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can comment" ON "listing_comments"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON "listing_comments"
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON "listing_comments"
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admin can delete any comment" ON "listing_comments"
  FOR DELETE USING (auth.email() IN ('shredraldz@gmail.com', 'admin@oromelo.ph', 'ermpolicarpio@gmail.com', 'raldz18@yahoo.com'));

-- LISTING INQUIRIES POLICIES
CREATE POLICY "Users can view own inquiries" ON "listing_inquiries"
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Listing owner can view inquiries for their listings" ON "listing_inquiries"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_id
      AND listings.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all inquiries" ON "listing_inquiries"
  FOR SELECT USING (auth.email() IN ('shredraldz@gmail.com', 'admin@oromelo.ph', 'ermpolicarpio@gmail.com', 'raldz18@yahoo.com'));

CREATE POLICY "Authenticated users can create inquiries" ON "listing_inquiries"
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update inquiries" ON "listing_inquiries"
  FOR UPDATE USING (auth.email() IN ('shredraldz@gmail.com', 'admin@oromelo.ph', 'ermpolicarpio@gmail.com', 'raldz18@yahoo.com'));

CREATE POLICY "Users can delete own inquiries" ON "listing_inquiries"
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Admin can delete any inquiry" ON "listing_inquiries"
  FOR DELETE USING (auth.email() IN ('shredraldz@gmail.com', 'admin@oromelo.ph', 'ermpolicarpio@gmail.com', 'raldz18@yahoo.com'));
```

## Storage Bucket Configuration

Add configuration for listing images storage:

```sql
-- Create additional storage bucket for listing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-images', 'listing-images', TRUE);

-- Set up access policies
CREATE POLICY "Public Access to Listing Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'listing-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own listing images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'listing-images' AND (owner = auth.uid() OR auth.email() IN ('shredraldz@gmail.com', 'admin@oromelo.ph', 'ermpolicarpio@gmail.com', 'raldz18@yahoo.com')));

CREATE POLICY "Users can delete their own listing images"
ON storage.objects FOR DELETE
USING (bucket_id = 'listing-images' AND (owner = auth.uid() OR auth.email() IN ('shredraldz@gmail.com', 'admin@oromelo.ph', 'ermpolicarpio@gmail.com', 'raldz18@yahoo.com')));
```

### 5. Configure Authentication

1. In your Supabase project, go to Authentication → Settings
2. Enable "Email Sign Up" under Email Auth
3. Set the Site URL to your application's URL
4. Create an admin user with the email specified in `src/config/constants.js`
5. Configure password reset and email confirmation templates if needed

### Setting Up Google Authentication

To enable Google sign-in for your application:

1. **Create OAuth Credentials in Google Cloud Console**:

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Navigate to "APIs & Services" > "Credentials"
   - Click "Create Credentials" and select "OAuth client ID"
   - Select "Web application" as the application type

### Setting Up Resend for Email Notifications

To configure Resend for sending transactional emails in your application:

1. **Create a Resend Account and API Key**:

   - Sign up at [Resend](https://resend.com/)
   - Verify your email address
   - Navigate to the API Keys section in your Resend dashboard
   - Click "Create API Key" and copy the generated key

2. **Configure Environment Variables**:
   Add the following to your `.env` file:

   ```
   VITE_RESEND_API_KEY=your-resend-api-key
   VITE_ADMIN_EMAILS=shredraldz@gmail.com,admin@oromelo.ph,ermpolicarpio@gmail.com,raldz18@yahoo.com
   ```

3. **Verify Your Domain (Recommended for Production)**:

   - In the Resend dashboard, go to "Domains"
   - Click "Add Domain" and follow the verification steps
   - This ensures emails are properly authenticated and less likely to be marked as spam

4. **Set Up Email Templates**:

   - The application includes email templates for various notifications
   - Templates can be customized in the `netlify/functions/send-email.js` file
   - You can preview and test templates in the Resend dashboard

5. **Testing Email Functionality**:

   - Use the contact form to send a test email
   - Check the browser console for any errors
   - Verify emails are received in the admin inboxes

6. **Monitor Email Deliverability**:
   - Use the Resend dashboard to track email delivery status
   - Set up webhooks for delivery notifications if needed
   - Monitor bounce and complaint rates to maintain good deliverability

> **Note**: For local development, you can use Resend's test API keys or set up a development domain in Resend to avoid sending test emails to real addresses.

- Add your local development URL (e.g., `http://localhost:5173`) to Authorized JavaScript origins
- Add both your local and production callback URLs to Authorized redirect URIs:
  - Local: `http://localhost:5173/auth/callback`
  - Production: `https://your-netlify-domain.netlify.app/auth/callback`
- Click "Create" and note your Client ID and Client Secret

2. **Configure Google OAuth in Supabase**:

   - In your Supabase dashboard, go to Authentication → Providers
   - Find "Google" in the list of providers and click "Enable"
   - Enter the Client ID and Client Secret from Google Cloud Console
   - Save the changes

3. **Set Redirect URLs in Supabase**:

   - In your Supabase project, go to Authentication → URL Configuration
   - Set "Site URL" to your production URL (e.g., `https://your-netlify-domain.netlify.app`)
   - Add redirect URLs for both local development and production:
     - `http://localhost:5173/auth/callback`
     - `https://your-netlify-domain.netlify.app/auth/callback`

4. **Update Your Application Code**:
   - Make sure your application has a proper route handler for `/auth/callback`
   - This is already implemented in the `AuthCallback.jsx` component

### 6. Connect Your Application

Update your `.env` file with the Supabase credentials:

```
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 7. Database Triggers (Optional)

Set up triggers to automatically update the `updated_at` timestamp:

```sql
-- Function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all tables
CREATE TRIGGER set_timestamp_profiles
BEFORE UPDATE ON "profiles"
FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

-- Create similar triggers for other tables
```

## Changing the Admin User

The admin user is defined in `src/config/constants.js`. To change the admin user:

1. Open `src/config/constants.js`
2. Modify the `ADMIN_EMAIL` constant:
   ```javascript
   export const ADMIN_EMAIL = "your-new-admin-email@example.com";
   ```
3. Create a user in Supabase Authentication with this exact email
4. Update any RLS policies in your database that reference the admin email:
   ```sql
   -- Example: Update Admin policies in the items table
   UPDATE policies
   SET definition = definition::text::jsonb ||
     jsonb_build_object('check', 'auth.email() = ''your-new-admin-email@example.com''')
   WHERE table = 'items' AND name LIKE '%Admin%';
   ```
5. Rebuild and redeploy your application

## Project Structure

```
oromelo-gold-pawn/
├── src/                      # Source files
│   ├── assets/               # Static assets
│   │   └── react.svg         # React logo
│   │
│   ├── components/         # Reusable components
│   │   ├── common/           # Common UI components
│   │   │   ├── Pagination.jsx   # Pagination component
│   │   │   └── StatusBadge.jsx  # Status badge component
│   │   │
│   │   ├── items/           # Item-related components
│   │   │   ├── ItemCard.jsx      # Card component for gold items
│   │   │   ├── ItemDetails.jsx   # Detailed item view
│   │   │   ├── ItemList.jsx      # List of items component
│   │   │   └── ItemTabs.jsx      # Tabbed interface for items
│   │   │
│   │   ├── AdminRoute.jsx      # Route protection for admin users
│   │   ├── AuthCallback.jsx    # Authentication callback handler
│   │   ├── ErrorBoundary.jsx   # Error boundary component
│   │   ├── FaqItem.jsx         # FAQ item component
│   │   ├── FaqSection.jsx      # FAQ section component
│   │   ├── Footer.jsx          # Application footer
│   │   ├── GoldParticles.jsx   # Interactive gold particle effects
│   │   ├── GoldPriceTracker.jsx # Gold price tracking component
│   │   ├── ItemActionButtons.jsx # Item action buttons
│   │   ├── Logo.jsx            # Application logo component
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── ParallaxEffect.jsx  # Parallax scrolling effects
│   │   ├── PrivateRoute.jsx    # Route protection for auth users
│   │   ├── StatusBadge.jsx     # Status indicator for items
│   │   ├── ThemeToggle.jsx     # Dark/light mode toggle
│   │   ├── TransactionForm.jsx # Transaction form component
│   │   └── WavyDivider.jsx     # Decorative wavy divider
│   │
│   ├── config/             # Configuration files
│   │   └── constants.js        # Application constants
│   │
│   ├── context/             # Context providers
│   │   ├── AuthContext.jsx     # Authentication context
│   │   ├── AuthProvider.jsx    # Auth context provider
│   │   ├── ThemeContext.js     # Theme context
│   │   ├── ThemeProvider.jsx   # Theme context provider
│   │   └── useAuth.js          # Authentication hook
│   │
│   ├── data/                # Static data
│   │   └── faqData.js          # FAQ content
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAdminItems.js    # Admin items management hook
│   │   ├── useAuth.js          # Authentication hook
│   │   ├── useItems.js         # Items data hook
│   │   ├── useTheme.js         # Theme management hook
│   │   └── useUserItems.js     # User items management hook
│   │
│   ├── pages/               # Application pages
│   │   ├── admin/             # Admin pages
│   │   │   └── AdminDashboard.jsx # Admin dashboard
│   │   │   └── ManageListings.jsx # Manage listings page
│   │   │   └── ListingInquiries.jsx # Listing inquiries page
│   │   │
│   │   ├── user/              # User pages
│   │   │   └── MyItems.jsx      # User's items page
│   │   │
│   │   ├── About.jsx          # About page
│   │   ├── Contact.jsx         # Contact page
│   │   ├── FAQ.jsx             # FAQ page
│   │   ├── ForgotPassword.jsx  # Password reset request
│   │   ├── Home.jsx            # Homepage
│   │   ├── Listings.jsx        # Browse listings page
│   │   ├── ListingDetail.jsx   # Individual listing detail
│   │   ├── NotFound.jsx        # 404 page
│   │   ├── PawnForm.jsx        # Pawn submission form
│   │   ├── Privacy.jsx         # Privacy policy
│   │   ├── Profile.jsx         # User profile page
│   │   ├── SellForm.jsx        # Sell item submission form
│   │   ├── SignIn.jsx          # Sign in page
│   │   ├── SignUp.jsx          # Sign up page
│   │   ├── Terms.jsx           # Terms of service
│   │   └── UpdatePassword.jsx  # Password reset confirmation
│   │
│   ├── services/           # External service integrations
│   │   ├── emailService.js # Email service integration
│   │   └── supabase.js     # Supabase client configuration
│   │
│   ├── styles/             # Additional styles
│   │   ├── kenburns.css    # Ken Burns effect for images
│   │   └── index.css       # Global styles including gold shimmer effect
│   │
│   ├── App.jsx             # Main application component
│   ├── App.css             # Global styles
│   ├── index.css           # Base styles
│   └── main.jsx            # Application entry point
│
├── public/                 # Public assets
│   └── images/             # Static images
│       ├── DTI.png         # DTI logo
│       ├── favicon.ico     # Favicon
│       ├── gold-bg.jpg     # Gold background
│       ├── hero-bg.avif    # Hero background (AVIF)
│       ├── hero-bg.jpg     # Hero background (JPEG)
│       ├── hero-bg2.jpg    # Secondary hero background
│       ├── oromelo-logo.png # App logo
│       └── oromelo.png     # App logo alternative
│
├── .env                    # Environment variables (gitignored)
├── .gitignore              # Git ignore file
├── netlify.toml            # Netlify deployment configuration
├── netlify/                # Netlify functions
│   └── functions/          # Serverless functions
│       └── send-email.js   # Email sending function
├── package.json            # Project dependencies
├── postcss.config.js       # PostCSS configuration
├── README.md               # Project documentation
├── tailwind.config.js      # Tailwind CSS configuration
└── vite.config.js          # Vite configuration
```

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/XXXXXXX/Oromelo-Gold-Pawn.git
   cd Oromelo-Gold-Pawn
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your credentials:

   ```
   # Supabase Configuration
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

   # API Keys
   VITE_METAL_PRICE_API_KEY=your-metal-price-api-key
   VITE_ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key

   # Email Configuration
   VITE_RESEND_API_KEY=your-resend-api-key
   VITE_ADMIN_EMAILS=email1@example.com,email2@example.com

   # Legacy EmailJS Configuration (optional)
   VITE_EMAILJS_SERVICE_ID=your-emailjs-service-id
   VITE_EMAILJS_PUBLIC_KEY=your-emailjs-public-key

   # Application Configuration
   VITE_APP_URL=http://localhost:5173  # Update with your production URL
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## Application Routes

Below is a complete list of all routes in the application, along with their access levels and purposes:

| Route              | Component        | Type      | Access              | Description                                         |
| ------------------ | ---------------- | --------- | ------------------- | --------------------------------------------------- |
| `/`                | Home             | Public    | Everyone            | Landing page with featured items and call-to-action |
| `/signin`          | SignIn           | Public    | Guests only         | User authentication page                            |
| `/signup`          | SignUp           | Public    | Guests only         | User registration page                              |
| `/forgot-password` | ForgotPassword   | Public    | Guests only         | Password recovery page                              |
| `/update-password` | UpdatePassword   | Public    | Authenticated users | Password reset page                                 |
| `/about`           | About            | Public    | Everyone            | Information about Oromelo Gold Pawn                 |
| `/contact`         | Contact          | Public    | Everyone            | Contact form page                                   |
| `/terms`           | Terms            | Public    | Everyone            | Terms of service                                    |
| `/privacy`         | Privacy          | Public    | Everyone            | Privacy policy                                      |
| `/faq`             | FAQ              | Public    | Everyone            | Frequently asked questions                          |
| `/admin`           | AdminDashboard   | Protected | Admin only          | Administrative dashboard                            |
| `/sell-item`       | SellForm         | Protected | Authenticated users | Form to list an item for sale                       |
| `/pawn-item`       | PawnForm         | Protected | Authenticated users | Form to request a pawn transaction                  |
| `/my-items`        | MyItems          | Protected | Authenticated users | User's listed items                                 |
| `/profile`         | Profile          | Protected | Authenticated users | User profile management                             |
| `/listings`        | Listings         | Public    | Everyone            | Browse all active gold listings                     |
| `/listing/:id`     | ListingDetail    | Public    | Everyone            | View detailed information about a specific listing  |
| `/admin/manage`    | ManageListings   | Protected | Admin only          | Manage all listings                                 |
| `/admin/inquiries` | ListingInquiries | Protected | Admin only          | View detailed information about a specific inquiry  |
| `*`                | NotFound         | Public    | Everyone            | 404 Not Found page                                  |

### Route Types:

- **Public**: Accessible to all visitors
- **Protected**: Requires authentication
- **Admin Only**: Requires admin privileges
- **Guests only**: Only accessible to non-authenticated users

## Deployment

### Netlify Deployment

This application is configured for deployment on Netlify. The `netlify.toml` file contains the necessary configuration.

To deploy to Netlify:

1. Push your code to a GitHub repository
2. Log in to [Netlify](https://www.netlify.com/)
3. Click "New site from Git" and select your repository
4. Set build command to `npm run build` and publish directory to `dist`
5. Add your environment variables in Netlify's UI:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_METAL_PRICE_API_KEY`
   - `VITE_ALPHA_VANTAGE_API_KEY`

### Troubleshooting Authentication Issues

If you encounter issues with authentication redirects (especially with Google Auth):

1. **Check your callback URL configuration**:

   - Make sure the exact redirect URL is added in both Supabase and Google Cloud Console
   - The URLs are case-sensitive and must match exactly

2. **Verify Netlify redirects**:

   - Ensure your `netlify.toml` has the correct redirect rule for `/auth/callback`
   - The file should contain:
     ```toml
     [[redirects]]
       from = "/auth/callback"
       to = "/index.html"
       status = 200
       force = true
     ```

3. **Update Content Security Policy**:

   - If you're getting CSP errors, update the Content-Security-Policy header in `netlify.toml`
   - Make sure it includes connections to Supabase domains

4. **Clear browser cookies and cache**:
   - Authentication issues can sometimes be resolved by clearing cookies
   - Try using an incognito/private browsing window for testing

## License

This project is licensed under the MIT License.
