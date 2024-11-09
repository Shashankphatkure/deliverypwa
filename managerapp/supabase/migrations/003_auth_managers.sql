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