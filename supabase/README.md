# OMA Digital Database Schema Files

This directory contains the SQL schema files for the OMA Digital platform. Each file serves a specific purpose in the database structure and management.

## File Descriptions

### 1. `complete_schema_final.sql`
**Main Schema File** - Contains the complete database schema with all tables properly ordered and structured with correct foreign key relationships.

**Key Features:**
- All tables in proper creation order to avoid dependency issues
- Comprehensive indexing strategy
- Built-in functions and triggers
- Default data insertion
- Row Level Security enablement
- Detailed table comments for documentation

### 2. `knowledge_base_final.sql`
**Knowledge Base Schema** - Contains only the knowledge base table and its associated data, indexes, and policies.

**Key Features:**
- Dedicated knowledge base table with vector embedding support
- Multi-language content (French and English)
- Comprehensive initial data set
- Optimized indexes for search performance
- RLS policies for secure access

### 3. `rls_policies_final.sql`
**Row Level Security Policies** - Contains all Row Level Security policies for all tables in the database.

**Key Features:**
- Table-specific access policies
- Role-based permissions (admin, authenticated, anonymous)
- Selective data disclosure
- Secure data insertion permissions

### 4. `migration_script.sql`
**Database Migration Script** - A script to properly set up the database by first dropping existing objects and then creating new ones.

**Key Features:**
- Drops existing objects in correct order to avoid conflicts
- Handles trigger and function dependencies properly
- Can be used to reset the database to a clean state

### 5. `schema_documentation.md`
**Schema Documentation** - Comprehensive documentation of the database schema including:
- Table relationships and descriptions
- Key features of each table
- Security implementation details
- Indexing strategy
- Usage guidelines

## Installation Order

To properly set up the database, you have two options:

### Option 1: Clean Installation (Recommended)
1. Run `migration_script.sql` to clean up any existing objects
2. Run `complete_schema_final.sql` to create all tables and basic structure
3. Run `rls_policies_final.sql` to apply security policies to all tables
4. Run `knowledge_base_final.sql` to add knowledge base content

### Option 2: Direct Installation
1. `complete_schema_final.sql` - Creates all tables and basic structure
2. `rls_policies_final.sql` - Applies security policies to all tables
3. `knowledge_base_final.sql` - Adds knowledge base content (optional, can be applied separately)

## Maintenance

- Run the `cleanup_old_performance_data()` function periodically to maintain database performance
- Update the `performance_config` table to adjust monitoring thresholds
- Add new knowledge base entries as needed for chatbot improvements

## Dependencies

- Requires the `vector` extension for similarity search capabilities
- Built for PostgreSQL with Supabase extensions
- Uses UUIDs for all primary keys for global uniqueness