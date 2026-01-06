-- Allow users to insert their own creator role
CREATE POLICY "Users can become creators"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND role = 'creator'
);