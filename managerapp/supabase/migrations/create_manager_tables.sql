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