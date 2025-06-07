## New Features

### Gold Listings Marketplace

- **Listings Browse Page**: View all available gold items with advanced filtering options
- **Interactive Listing Detail**: Individual listing pages with detailed information
- **Lightbox Gallery**: Full-screen image viewer with navigation controls on listing detail pages
- **Featured Items Section**: Homepage showcase of 3 most popular items based on like counts
- **Social Features**: Like and comment on listings to increase engagement
- **User Inquiries**: Send direct inquiries about specific listings to sellers

### Admin Features

- **Listings Management**: Admin dashboard for managing all listings
- **Inquiry Management**: View and respond to user inquiries about listings
- **Featured Control**: Monitor popular items that appear in the Featured section

## Additional Database Schema

### Listings Table

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

### Listing Likes Table

Tracking likes on listings to determine popularity.

| Column Name | Data Type | Description                                  | Constraints   |
| ----------- | --------- | -------------------------------------------- | ------------- |
| id          | UUID      | Unique like ID                               | PRIMARY KEY   |
| user_id     | UUID      | User who liked the listing                   | NOT NULL      |
| listing_id  | UUID      | ID of liked listing (references listings.id) | NOT NULL      |
| created_at  | TIMESTAMP | Creation timestamp                           | DEFAULT now() |

### Listing Comments Table

Stores user comments on listings.

| Column Name | Data Type | Description                                      | Constraints   |
| ----------- | --------- | ------------------------------------------------ | ------------- |
| id          | UUID      | Unique comment ID                                | PRIMARY KEY   |
| user_id     | UUID      | User who made the comment                        | NOT NULL      |
| listing_id  | UUID      | ID of commented listing (references listings.id) | NOT NULL      |
| comment     | TEXT      | Comment text                                     | NOT NULL      |
| created_at  | TIMESTAMP | Creation timestamp                               | DEFAULT now() |
| updated_at  | TIMESTAMP | Last update timestamp                            | DEFAULT now() |

### Listing Inquiries Table

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

## New Application Routes

The application includes the following routes:

| Route             | Component        | Type      | Access     | Description                                        |
| ----------------- | ---------------- | --------- | ---------- | -------------------------------------------------- |
| `/listings`       | Listings         | Public    | Everyone   | Browse all active gold listings                    |
| `/listing/:id`    | ListingDetail    | Public    | Everyone   | View detailed information about a specific listing |
| `/admin/manage`   | ManageListings   | Protected | Admin only | Manage all listings                                |
| `admin/inquiries` | ListingInquiries | Protected | Admin only | View detailed information about a specific inquiry |

### Public Routes

- `/listings` - Browse all active gold listings
- `/listing/:id` - View detailed information about a specific listing

### Admin Routes

- `/admin/manage` - Manage all listings
- `/admin/inquiries` - View and respond to listing inquiries
