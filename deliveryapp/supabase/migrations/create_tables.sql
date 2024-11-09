-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Users table (customers)
create table users (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    phone text,
    full_name text,
    address text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Restaurants/Stores table
create table stores (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    address text not null,
    phone text,
    image_url text,
    is_active boolean default true,
    opening_time time,
    closing_time time,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Categories table (for menu items)
create table categories (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    store_id uuid references stores(id) on delete cascade,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Menu Items table
create table menu_items (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    price decimal(10,2) not null,
    image_url text,
    is_available boolean default true,
    store_id uuid references stores(id) on delete cascade,
    category_id uuid references categories(id) on delete set null,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Orders table
create table orders (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete set null,
    store_id uuid references stores(id) on delete set null,
    delivery_address text not null,
    total_amount decimal(10,2) not null,
    status text check (status in ('pending', 'confirmed', 'preparing', 'picked_up', 'delivered', 'cancelled')) default 'pending',
    payment_status text check (payment_status in ('pending', 'completed', 'failed')) default 'pending',
    payment_method text,
    delivery_notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Order Items table
create table order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid references orders(id) on delete cascade,
    menu_item_id uuid references menu_items(id) on delete set null,
    quantity integer not null,
    price_at_time decimal(10,2) not null,
    special_instructions text,
    created_at timestamp with time zone default now()
);

-- Delivery Personnel table
create table delivery_personnel (
    id uuid primary key default uuid_generate_v4(),
    full_name text not null,
    email text unique not null,
    phone text not null,
    is_active boolean default true,
    current_location_lat decimal(10,8),
    current_location_lng decimal(11,8),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Delivery Assignments table
create table delivery_assignments (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid references orders(id) on delete cascade,
    delivery_personnel_id uuid references delivery_personnel(id) on delete set null,
    status text check (status in ('assigned', 'picked_up', 'delivered', 'cancelled')) default 'assigned',
    pickup_time timestamp with time zone,
    delivery_time timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Reviews table
create table reviews (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references users(id) on delete set null,
    order_id uuid references orders(id) on delete cascade,
    store_rating integer check (store_rating between 1 and 5),
    delivery_rating integer check (delivery_rating between 1 and 5),
    comment text,
    created_at timestamp with time zone default now()
);

-- Create triggers for updated_at timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Add updated_at triggers to all relevant tables
create trigger update_users_updated_at
    before update on users
    for each row execute function update_updated_at_column();

create trigger update_stores_updated_at
    before update on stores
    for each row execute function update_updated_at_column();

create trigger update_categories_updated_at
    before update on categories
    for each row execute function update_updated_at_column();

create trigger update_menu_items_updated_at
    before update on menu_items
    for each row execute function update_updated_at_column();

create trigger update_orders_updated_at
    before update on orders
    for each row execute function update_updated_at_column();

create trigger update_delivery_personnel_updated_at
    before update on delivery_personnel
    for each row execute function update_updated_at_column();

create trigger update_delivery_assignments_updated_at
    before update on delivery_assignments
    for each row execute function update_updated_at_column(); 