-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- Managers table
create table managers (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    full_name text not null,
    phone text,
    role text check (role in ('admin', 'supervisor')) default 'supervisor',
    is_active boolean default true,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Create trigger for updated_at timestamp
create trigger update_managers_updated_at
    before update on managers
    for each row execute function update_updated_at_column(); 


-- Update managers table to include auth fields
ALTER TABLE managers
ADD COLUMN auth_id uuid REFERENCES auth.users(id);

-- Create a function to handle new manager creation
CREATE OR REPLACE FUNCTION handle_new_manager()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO managers (email, full_name, auth_id, role)
    VALUES (NEW.email, NEW.raw_user_meta_data->>'full_name', NEW.id, 'admin');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create manager record
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_manager();     



-- Driver Authentication table (links to delivery_personnel)
create table driver_auth (
    id uuid primary key references delivery_personnel(id),
    password_hash text not null,
    last_login timestamp with time zone,
    reset_token text,
    reset_token_expires timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Notifications table
create table notifications (
    id uuid primary key default uuid_generate_v4(),
    recipient_type text check (recipient_type in ('driver', 'manager', 'customer')),
    recipient_id uuid not null,
    title text not null,
    message text not null,
    is_read boolean default false,
    type text check (type in ('order', 'payment', 'penalty', 'system')),
    created_at timestamp with time zone default now()
);

-- Driver Payments table
create table driver_payments (
    id uuid primary key default uuid_generate_v4(),
    driver_id uuid references delivery_personnel(id),
    amount decimal(10,2) not null,
    payment_type text check (payment_type in ('salary', 'bonus', 'penalty')),
    status text check (status in ('pending', 'completed', 'failed')) default 'pending',
    description text,
    payment_date timestamp with time zone,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Penalties table
create table penalties (
    id uuid primary key default uuid_generate_v4(),
    driver_id uuid references delivery_personnel(id),
    amount decimal(10,2) not null,
    reason text not null,
    status text check (status in ('pending', 'processed', 'disputed', 'cancelled')) default 'pending',
    created_by uuid references managers(id),
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Order Transfer History table
create table order_transfers (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid references orders(id),
    from_driver_id uuid references delivery_personnel(id),
    to_driver_id uuid references delivery_personnel(id),
    reason text not null,
    transferred_by uuid references managers(id),
    created_at timestamp with time zone default now()
);

-- Add triggers for updated_at
create trigger update_driver_auth_updated_at
    before update on driver_auth
    for each row execute function update_updated_at_column();

create trigger update_driver_payments_updated_at
    before update on driver_payments
    for each row execute function update_updated_at_column();

create trigger update_penalties_updated_at
    before update on penalties
    for each row execute function update_updated_at_column();     



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