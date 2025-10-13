-- Add pagination support for large datasets using database functions

-- Function to get paginated conversations
CREATE OR REPLACE FUNCTION get_paginated_conversations(
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 50,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'DESC'
)
RETURNS TABLE(
  id UUID,
  user_id TEXT,
  session_id TEXT,
  language VARCHAR(2),
  context JSONB,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.user_id,
    c.session_id,
    c.language,
    c.context,
    c.metadata,
    c.created_at,
    c.updated_at,
    COUNT(*) OVER() as total_count
  FROM conversations c
  ORDER BY 
    CASE 
      WHEN sort_order = 'ASC' THEN
        CASE sort_by
          WHEN 'created_at' THEN c.created_at::text
          WHEN 'updated_at' THEN c.updated_at::text
          WHEN 'user_id' THEN c.user_id
          WHEN 'session_id' THEN c.session_id
          ELSE c.created_at::text
        END
      ELSE '9999-12-31'::text
    END ASC,
    CASE 
      WHEN sort_order = 'DESC' THEN
        CASE sort_by
          WHEN 'created_at' THEN c.created_at::text
          WHEN 'updated_at' THEN c.updated_at::text
          WHEN 'user_id' THEN c.user_id
          WHEN 'session_id' THEN c.session_id
          ELSE c.created_at::text
        END
      ELSE '0001-01-01'::text
    END DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to get paginated messages
CREATE OR REPLACE FUNCTION get_paginated_messages(
  conversation_id UUID,
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 50,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'ASC'
)
RETURNS TABLE(
  id UUID,
  conversation_id UUID,
  content TEXT,
  sender VARCHAR(10),
  message_type VARCHAR(20),
  language VARCHAR(2),
  confidence FLOAT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.conversation_id,
    m.content,
    m.sender,
    m.message_type,
    m.language,
    m.confidence,
    m.metadata,
    m.created_at,
    COUNT(*) OVER() as total_count
  FROM messages m
  WHERE m.conversation_id = conversation_id
  ORDER BY 
    CASE 
      WHEN sort_order = 'ASC' THEN
        CASE sort_by
          WHEN 'created_at' THEN m.created_at::text
          WHEN 'sender' THEN m.sender
          WHEN 'message_type' THEN m.message_type
          ELSE m.created_at::text
        END
      ELSE '9999-12-31'::text
    END ASC,
    CASE 
      WHEN sort_order = 'DESC' THEN
        CASE sort_by
          WHEN 'created_at' THEN m.created_at::text
          WHEN 'sender' THEN m.sender
          WHEN 'message_type' THEN m.message_type
          ELSE m.created_at::text
        END
      ELSE '0001-01-01'::text
    END DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to get paginated quotes
CREATE OR REPLACE FUNCTION get_paginated_quotes(
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 50,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'DESC',
  status_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  email TEXT,
  phone TEXT,
  company TEXT,
  service TEXT,
  message TEXT,
  budget TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    q.id,
    q.name,
    q.email,
    q.phone,
    q.company,
    q.service,
    q.message,
    q.budget,
    q.status,
    q.created_at,
    q.updated_at,
    COUNT(*) OVER() as total_count
  FROM quotes q
  WHERE (status_filter IS NULL OR q.status = status_filter)
  ORDER BY 
    CASE 
      WHEN sort_order = 'ASC' THEN
        CASE sort_by
          WHEN 'created_at' THEN q.created_at::text
          WHEN 'name' THEN q.name
          WHEN 'email' THEN q.email
          WHEN 'status' THEN q.status
          ELSE q.created_at::text
        END
      ELSE '9999-12-31'::text
    END ASC,
    CASE 
      WHEN sort_order = 'DESC' THEN
        CASE sort_by
          WHEN 'created_at' THEN q.created_at::text
          WHEN 'name' THEN q.name
          WHEN 'email' THEN q.email
          WHEN 'status' THEN q.status
          ELSE q.created_at::text
        END
      ELSE '0001-01-01'::text
    END DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to get paginated blog articles
CREATE OR REPLACE FUNCTION get_paginated_blog_articles(
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 50,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'DESC',
  status_filter TEXT DEFAULT NULL,
  language_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  content TEXT,
  excerpt TEXT,
  slug TEXT,
  language TEXT,
  status TEXT,
  author_id UUID,
  tags TEXT[],
  featured_image_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  reading_time INTEGER,
  word_count INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.content,
    b.excerpt,
    b.slug,
    b.language,
    b.status,
    b.author_id,
    b.tags,
    b.featured_image_url,
    b.seo_title,
    b.seo_description,
    b.reading_time,
    b.word_count,
    b.created_at,
    b.updated_at,
    b.published_at,
    COUNT(*) OVER() as total_count
  FROM blog_articles b
  WHERE (status_filter IS NULL OR b.status = status_filter)
    AND (language_filter IS NULL OR b.language = language_filter)
  ORDER BY 
    CASE 
      WHEN sort_order = 'ASC' THEN
        CASE sort_by
          WHEN 'created_at' THEN b.created_at::text
          WHEN 'published_at' THEN COALESCE(b.published_at, '0001-01-01'::timestamptz)::text
          WHEN 'title' THEN b.title
          WHEN 'status' THEN b.status
          ELSE b.created_at::text
        END
      ELSE '9999-12-31'::text
    END ASC,
    CASE 
      WHEN sort_order = 'DESC' THEN
        CASE sort_by
          WHEN 'created_at' THEN b.created_at::text
          WHEN 'published_at' THEN COALESCE(b.published_at, '9999-12-31'::timestamptz)::text
          WHEN 'title' THEN b.title
          WHEN 'status' THEN b.status
          ELSE b.created_at::text
        END
      ELSE '0001-01-01'::text
    END DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to get paginated analytics events
CREATE OR REPLACE FUNCTION get_paginated_analytics_events(
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 50,
  sort_by TEXT DEFAULT 'timestamp',
  sort_order TEXT DEFAULT 'DESC',
  event_name_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  event_name TEXT,
  event_properties JSONB,
  user_id UUID,
  session_id TEXT,
  timestamp TIMESTAMPTZ,
  url TEXT,
  user_agent TEXT,
  ip_address TEXT,
  metadata JSONB,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.event_name,
    a.event_properties,
    a.user_id,
    a.session_id,
    a.timestamp,
    a.url,
    a.user_agent,
    a.ip_address,
    a.metadata,
    COUNT(*) OVER() as total_count
  FROM analytics_events a
  WHERE (event_name_filter IS NULL OR a.event_name = event_name_filter)
  ORDER BY 
    CASE 
      WHEN sort_order = 'ASC' THEN
        CASE sort_by
          WHEN 'timestamp' THEN a.timestamp::text
          WHEN 'event_name' THEN a.event_name
          WHEN 'session_id' THEN a.session_id
          ELSE a.timestamp::text
        END
      ELSE '9999-12-31'::text
    END ASC,
    CASE 
      WHEN sort_order = 'DESC' THEN
        CASE sort_by
          WHEN 'timestamp' THEN a.timestamp::text
          WHEN 'event_name' THEN a.event_name
          WHEN 'session_id' THEN a.session_id
          ELSE a.timestamp::text
        END
      ELSE '0001-01-01'::text
    END DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;

-- Function to get paginated chatbot interactions
CREATE OR REPLACE FUNCTION get_paginated_chatbot_interactions(
  page_number INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 50,
  sort_by TEXT DEFAULT 'timestamp',
  sort_order TEXT DEFAULT 'DESC',
  sentiment_filter TEXT DEFAULT NULL
)
RETURNS TABLE(
  message_id TEXT,
  user_id UUID,
  session_id TEXT,
  message_text TEXT,
  response_text TEXT,
  input_method TEXT,
  response_time INTEGER,
  sentiment TEXT,
  timestamp TIMESTAMPTZ,
  conversation_length INTEGER,
  user_satisfaction INTEGER,
  total_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.message_id,
    c.user_id,
    c.session_id,
    c.message_text,
    c.response_text,
    c.input_method,
    c.response_time,
    c.sentiment,
    c.timestamp,
    c.conversation_length,
    c.user_satisfaction,
    COUNT(*) OVER() as total_count
  FROM chatbot_interactions c
  WHERE (sentiment_filter IS NULL OR c.sentiment = sentiment_filter)
  ORDER BY 
    CASE 
      WHEN sort_order = 'ASC' THEN
        CASE sort_by
          WHEN 'timestamp' THEN c.timestamp::text
          WHEN 'session_id' THEN c.session_id
          WHEN 'sentiment' THEN c.sentiment
          ELSE c.timestamp::text
        END
      ELSE '9999-12-31'::text
    END ASC,
    CASE 
      WHEN sort_order = 'DESC' THEN
        CASE sort_by
          WHEN 'timestamp' THEN c.timestamp::text
          WHEN 'session_id' THEN c.session_id
          WHEN 'sentiment' THEN c.sentiment
          ELSE c.timestamp::text
        END
      ELSE '0001-01-01'::text
    END DESC
  LIMIT page_size
  OFFSET (page_number - 1) * page_size;
END;
$$ LANGUAGE plpgsql;