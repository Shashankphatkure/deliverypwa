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