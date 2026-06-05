-- Add INSERT policy for users table to allow profile creation during signup
CREATE POLICY "Users can insert their own profile during signup" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Also allow INSERT for admins/superadmins to create staff accounts
CREATE POLICY "Admins can create user profiles" ON users
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );
