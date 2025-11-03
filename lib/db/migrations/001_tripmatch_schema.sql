-- =====================================================
-- TripMatch Database Schema
-- Social Travel Network with Credit Rewards System
-- =====================================================

-- =====================================================
-- 1. USER CREDITS SYSTEM
-- =====================================================

CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0, -- Credits in cents ($1 = 100 credits)
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  lifetime_spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);

-- Credit transaction ledger
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  amount INTEGER NOT NULL, -- Positive = earned, Negative = spent
  type VARCHAR(50) NOT NULL, -- 'earned_trip_creation', 'earned_referral', 'spent_booking', 'bonus', 'refund'
  source VARCHAR(50) NOT NULL, -- 'trip_creation', 'member_join', 'booking', 'admin', 'promotional'

  -- Related entities
  trip_id UUID REFERENCES trip_groups(id) ON DELETE SET NULL,
  booking_id UUID,
  description TEXT,
  metadata JSONB, -- Additional data like member_count, trip_details, etc.

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_trip_id ON credit_transactions(trip_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at DESC);

-- =====================================================
-- 2. TRIP GROUPS (Core entity)
-- =====================================================

CREATE TABLE IF NOT EXISTS trip_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  destination VARCHAR(255) NOT NULL,
  destination_code VARCHAR(10), -- IATA code
  destination_country VARCHAR(100),

  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Category & Type
  category VARCHAR(50) NOT NULL, -- 'vacation', 'party', 'spring_break', 'girls_trip', 'bachelor', 'bachelorette', 'family', 'backpacker', 'adventure', 'cultural', 'wellness'
  visibility VARCHAR(20) NOT NULL DEFAULT 'public', -- 'public', 'private'

  -- Members
  creator_id VARCHAR(255) NOT NULL,
  min_members INTEGER NOT NULL DEFAULT 2,
  max_members INTEGER NOT NULL DEFAULT 12,
  current_members INTEGER NOT NULL DEFAULT 1,

  -- Pricing
  estimated_price_per_person INTEGER, -- In cents
  total_booking_value INTEGER DEFAULT 0, -- In cents

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'booking_open', 'booking_closed', 'confirmed', 'completed', 'cancelled'

  -- Features
  featured BOOLEAN DEFAULT FALSE,
  trending BOOLEAN DEFAULT FALSE,

  -- Images
  cover_image_url TEXT,
  images JSONB, -- Array of image URLs

  -- Metadata
  tags TEXT[], -- ['beach', 'nightlife', 'luxury', etc.]
  rules TEXT, -- Group rules set by creator
  metadata JSONB, -- Additional flexible data

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_trip_groups_creator_id ON trip_groups(creator_id);
CREATE INDEX idx_trip_groups_status ON trip_groups(status);
CREATE INDEX idx_trip_groups_visibility ON trip_groups(visibility);
CREATE INDEX idx_trip_groups_start_date ON trip_groups(start_date);
CREATE INDEX idx_trip_groups_category ON trip_groups(category);
CREATE INDEX idx_trip_groups_featured ON trip_groups(featured) WHERE featured = TRUE;
CREATE INDEX idx_trip_groups_trending ON trip_groups(trending) WHERE trending = TRUE;

-- =====================================================
-- 3. TRIP COMPONENTS (Modular trip building)
-- =====================================================

CREATE TABLE IF NOT EXISTS trip_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,

  -- Component Type
  type VARCHAR(20) NOT NULL, -- 'flight', 'hotel', 'car', 'tour', 'activity', 'insurance', 'transfer'

  -- Provider Data (cached from API)
  provider VARCHAR(50), -- 'amadeus', 'duffel', 'liteapi', 'getyourguide', etc.
  provider_id VARCHAR(255), -- External ID from provider
  provider_data JSONB, -- Full API response cached

  -- Pricing
  base_price_per_person INTEGER NOT NULL, -- In cents
  total_price INTEGER NOT NULL, -- In cents (base_price * members)
  currency VARCHAR(3) DEFAULT 'USD',

  -- Details
  title VARCHAR(255) NOT NULL,
  description TEXT,

  -- Dates/Times (for flights, activities)
  start_datetime TIMESTAMP WITH TIME ZONE,
  end_datetime TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,

  -- Location (for hotels, activities)
  location VARCHAR(255),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),

  -- Customization
  is_optional BOOLEAN DEFAULT FALSE,
  is_required BOOLEAN DEFAULT TRUE,
  customization_options JSONB, -- Upgrades, add-ons, preferences

  -- Display
  display_order INTEGER DEFAULT 0,
  image_url TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trip_components_trip_id ON trip_components(trip_id);
CREATE INDEX idx_trip_components_type ON trip_components(type);
CREATE INDEX idx_trip_components_display_order ON trip_components(trip_id, display_order);

-- =====================================================
-- 4. GROUP MEMBERS
-- =====================================================

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,

  -- Role
  role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'creator', 'admin', 'member'

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'invited', -- 'invited', 'viewing', 'customizing', 'confirmed', 'paid', 'declined', 'removed'

  -- Invitation
  invited_by VARCHAR(255),
  invite_code VARCHAR(50) UNIQUE,
  invitation_message TEXT,

  -- User Details (cached for display)
  user_name VARCHAR(255),
  user_email VARCHAR(255),
  user_avatar_url TEXT,

  -- Customizations
  customizations JSONB, -- Component-specific customizations

  -- Pricing (can differ from base if customized)
  total_price INTEGER, -- In cents
  credits_applied INTEGER DEFAULT 0, -- Credits used on this booking
  amount_paid INTEGER DEFAULT 0, -- In cents

  -- Payment
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'refunded', 'failed'
  payment_intent_id VARCHAR(255),
  paid_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(trip_id, user_id)
);

CREATE INDEX idx_group_members_trip_id ON group_members(trip_id);
CREATE INDEX idx_group_members_user_id ON group_members(user_id);
CREATE INDEX idx_group_members_status ON group_members(status);
CREATE INDEX idx_group_members_role ON group_members(role);
CREATE INDEX idx_group_members_invite_code ON group_members(invite_code) WHERE invite_code IS NOT NULL;

-- =====================================================
-- 5. MEMBER CUSTOMIZATIONS (Individual preferences)
-- =====================================================

CREATE TABLE IF NOT EXISTS member_customizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES trip_components(id) ON DELETE CASCADE,

  -- Customization Type
  customization_type VARCHAR(50) NOT NULL, -- 'upgrade', 'downgrade', 'opt_out', 'opt_in', 'preference'

  -- Details
  title VARCHAR(255) NOT NULL, -- e.g., "Business Class Upgrade"
  description TEXT,

  -- Pricing Impact
  price_difference INTEGER NOT NULL DEFAULT 0, -- In cents (can be negative for opt-outs)

  -- Data
  customization_data JSONB, -- Specific customization details

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(member_id, component_id)
);

CREATE INDEX idx_member_customizations_member_id ON member_customizations(member_id);
CREATE INDEX idx_member_customizations_component_id ON member_customizations(component_id);

-- =====================================================
-- 6. GROUP BOOKINGS (Shared transactions)
-- =====================================================

CREATE TABLE IF NOT EXISTS group_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trip_groups(id) ON DELETE RESTRICT,
  component_id UUID REFERENCES trip_components(id) ON DELETE RESTRICT,

  -- Booking Type
  booking_type VARCHAR(20) NOT NULL, -- 'flight', 'hotel', 'car', 'tour', 'insurance'

  -- Provider
  provider VARCHAR(50) NOT NULL,
  provider_booking_id VARCHAR(255),
  provider_confirmation_code VARCHAR(100),

  -- Pricing
  total_price INTEGER NOT NULL, -- In cents
  price_per_person INTEGER NOT NULL, -- In cents
  currency VARCHAR(3) DEFAULT 'USD',

  -- Payment Splits
  payment_splits JSONB NOT NULL, -- [{user_id, amount, status, paid_at}, ...]

  -- Status
  booking_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'partial', 'complete', 'refunded'

  -- Data
  booking_data JSONB, -- Full booking details from provider
  confirmation_documents JSONB, -- Tickets, vouchers, etc.

  -- Timestamps
  booked_at TIMESTAMP WITH TIME ZONE,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_group_bookings_trip_id ON group_bookings(trip_id);
CREATE INDEX idx_group_bookings_booking_status ON group_bookings(booking_status);
CREATE INDEX idx_group_bookings_payment_status ON group_bookings(payment_status);

-- =====================================================
-- 7. SOCIAL FEED (Posts, photos, updates)
-- =====================================================

CREATE TABLE IF NOT EXISTS trip_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,

  -- Content
  content TEXT,
  media_urls JSONB, -- Array of image/video URLs
  media_type VARCHAR(20), -- 'photo', 'video', 'mixed'

  -- Location (optional)
  location VARCHAR(255),
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),

  -- Engagement
  reactions_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,

  -- Visibility
  visibility VARCHAR(20) DEFAULT 'group', -- 'group', 'public'

  -- Type
  post_type VARCHAR(20) DEFAULT 'update', -- 'update', 'photo', 'memory', 'announcement'

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trip_posts_trip_id ON trip_posts(trip_id);
CREATE INDEX idx_trip_posts_user_id ON trip_posts(user_id);
CREATE INDEX idx_trip_posts_created_at ON trip_posts(created_at DESC);

-- Reactions to posts
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES trip_posts(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,

  reaction_type VARCHAR(20) NOT NULL, -- 'like', 'love', 'wow', 'haha', 'fire'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX idx_post_reactions_user_id ON post_reactions(user_id);

-- Comments on posts
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES trip_posts(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,

  content TEXT NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX idx_post_comments_user_id ON post_comments(user_id);

-- =====================================================
-- 8. MESSAGING (Group chat)
-- =====================================================

CREATE TABLE IF NOT EXISTS trip_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,

  -- Content
  message TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text', -- 'text', 'image', 'system'

  -- Attachments
  attachments JSONB, -- URLs to images, files, etc.

  -- System messages
  is_system_message BOOLEAN DEFAULT FALSE,
  system_event VARCHAR(50), -- 'member_joined', 'booking_confirmed', etc.

  -- Read receipts
  read_by JSONB DEFAULT '[]'::jsonb, -- Array of user_ids

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trip_messages_trip_id ON trip_messages(trip_id);
CREATE INDEX idx_trip_messages_created_at ON trip_messages(trip_id, created_at DESC);

-- =====================================================
-- 9. USER PROFILES (Extended travel preferences)
-- =====================================================

CREATE TABLE IF NOT EXISTS tripmatch_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL UNIQUE,

  -- Basic Info
  display_name VARCHAR(255),
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,

  -- Travel Preferences
  travel_style JSONB, -- ['adventurer', 'luxury', 'budget', 'cultural', 'party']
  interests JSONB, -- ['beach', 'nightlife', 'hiking', 'food', 'photography']
  languages_spoken JSONB, -- ['en', 'es', 'fr']

  -- Demographics (optional, for matching)
  age_range VARCHAR(20), -- '18-25', '26-35', '36-45', etc.
  gender VARCHAR(20),
  location_city VARCHAR(255),
  location_country VARCHAR(100),

  -- Verification
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  id_verified BOOLEAN DEFAULT FALSE,

  -- Safety & Trust
  safety_score INTEGER DEFAULT 0, -- 0-100
  verification_level INTEGER DEFAULT 1, -- 1-4

  -- Statistics
  trips_created INTEGER DEFAULT 0,
  trips_joined INTEGER DEFAULT 0,
  trips_completed INTEGER DEFAULT 0,
  total_companions_met INTEGER DEFAULT 0,

  -- Ratings (from other members)
  avg_rating DECIMAL(3, 2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,

  -- AI/ML
  personality_vector JSONB, -- 128-dimensional embedding for matching

  -- Settings
  settings JSONB, -- Notification preferences, privacy settings, etc.

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tripmatch_profiles_user_id ON tripmatch_user_profiles(user_id);
CREATE INDEX idx_tripmatch_profiles_verification_level ON tripmatch_user_profiles(verification_level);

-- =====================================================
-- 10. REVIEWS & RATINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS trip_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES trip_groups(id) ON DELETE CASCADE,
  reviewer_id VARCHAR(255) NOT NULL,
  reviewed_user_id VARCHAR(255) NOT NULL, -- User being reviewed

  -- Rating
  overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
  reliability_rating INTEGER CHECK (reliability_rating >= 1 AND reliability_rating <= 5),
  friendliness_rating INTEGER CHECK (friendliness_rating >= 1 AND friendliness_rating <= 5),

  -- Review
  review_text TEXT,

  -- Visibility
  is_public BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(trip_id, reviewer_id, reviewed_user_id)
);

CREATE INDEX idx_trip_reviews_trip_id ON trip_reviews(trip_id);
CREATE INDEX idx_trip_reviews_reviewed_user_id ON trip_reviews(reviewed_user_id);

-- =====================================================
-- 11. TRIGGERS & FUNCTIONS
-- =====================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trip_groups_updated_at BEFORE UPDATE ON trip_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_group_members_updated_at BEFORE UPDATE ON group_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_credits_updated_at BEFORE UPDATE ON user_credits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tripmatch_profiles_updated_at BEFORE UPDATE ON tripmatch_user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update member count when members join/leave
CREATE OR REPLACE FUNCTION update_trip_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('confirmed', 'paid') THEN
    UPDATE trip_groups
    SET current_members = current_members + 1,
        updated_at = NOW()
    WHERE id = NEW.trip_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status IN ('confirmed', 'paid') THEN
    UPDATE trip_groups
    SET current_members = GREATEST(1, current_members - 1),
        updated_at = NOW()
    WHERE id = OLD.trip_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status NOT IN ('confirmed', 'paid') AND NEW.status IN ('confirmed', 'paid') THEN
      UPDATE trip_groups
      SET current_members = current_members + 1,
          updated_at = NOW()
      WHERE id = NEW.trip_id;
    ELSIF OLD.status IN ('confirmed', 'paid') AND NEW.status NOT IN ('confirmed', 'paid') THEN
      UPDATE trip_groups
      SET current_members = GREATEST(1, current_members - 1),
          updated_at = NOW()
      WHERE id = NEW.trip_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trip_member_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_trip_member_count();

-- Update user credit balance when transaction is added
CREATE OR REPLACE FUNCTION update_user_credit_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Update balance
  UPDATE user_credits
  SET
    balance = balance + NEW.amount,
    lifetime_earned = CASE WHEN NEW.amount > 0 THEN lifetime_earned + NEW.amount ELSE lifetime_earned END,
    lifetime_spent = CASE WHEN NEW.amount < 0 THEN lifetime_spent + ABS(NEW.amount) ELSE lifetime_spent END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;

  -- Create user_credits record if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO user_credits (user_id, balance, lifetime_earned, lifetime_spent)
    VALUES (
      NEW.user_id,
      NEW.amount,
      CASE WHEN NEW.amount > 0 THEN NEW.amount ELSE 0 END,
      CASE WHEN NEW.amount < 0 THEN ABS(NEW.amount) ELSE 0 END
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_credit_balance_trigger
AFTER INSERT ON credit_transactions
FOR EACH ROW EXECUTE FUNCTION update_user_credit_balance();

-- Update post reactions count
CREATE OR REPLACE FUNCTION update_post_reactions_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE trip_posts SET reactions_count = reactions_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE trip_posts SET reactions_count = GREATEST(0, reactions_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_reactions_count_trigger
AFTER INSERT OR DELETE ON post_reactions
FOR EACH ROW EXECUTE FUNCTION update_post_reactions_count();

-- Update post comments count
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE trip_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE trip_posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_comments_count_trigger
AFTER INSERT OR DELETE ON post_comments
FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- =====================================================
-- INITIAL DATA & INDEXES COMPLETED
-- =====================================================

COMMENT ON TABLE trip_groups IS 'Core trip group entity - represents a travel group created by a user';
COMMENT ON TABLE trip_components IS 'Modular components that make up a trip (flights, hotels, cars, tours, etc.)';
COMMENT ON TABLE group_members IS 'Members of trip groups with their customizations and payment status';
COMMENT ON TABLE user_credits IS 'User credit balances for the reward system';
COMMENT ON TABLE credit_transactions IS 'Ledger of all credit transactions (earned and spent)';
COMMENT ON TABLE group_bookings IS 'Confirmed bookings for trip components with payment splits';
COMMENT ON TABLE trip_posts IS 'Social feed posts within trip groups';
COMMENT ON TABLE tripmatch_user_profiles IS 'Extended user profiles with travel preferences for matching';
