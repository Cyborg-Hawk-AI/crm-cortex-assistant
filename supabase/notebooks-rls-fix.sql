
-- First, ensure profiles table has the right RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can view their own profile
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Now fix the notebooks table policies
ALTER TABLE public.notebooks ENABLE ROW LEVEL SECURITY;

-- Everyone can view their own notebooks
CREATE POLICY "Users can view their own notebooks"
  ON public.notebooks FOR SELECT
  USING (user_id = auth.uid());

-- Critical: Allow users to create notebooks with their user_id
CREATE POLICY "Users can create their own notebooks"
  ON public.notebooks FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Allow users to update their own notebooks
CREATE POLICY "Users can update their own notebooks"
  ON public.notebooks FOR UPDATE
  USING (user_id = auth.uid());

-- Allow users to delete their own notebooks
CREATE POLICY "Users can delete their own notebooks"
  ON public.notebooks FOR DELETE
  USING (user_id = auth.uid());

-- Fix the notes table policies
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Users can view their own notes
CREATE POLICY "Users can view their own notes"
  ON public.notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.notebooks
      WHERE notebooks.id = notes.notebook_id
      AND notebooks.user_id = auth.uid()
    )
  );

-- Users can create notes in their notebooks
CREATE POLICY "Users can create notes in their notebooks"
  ON public.notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.notebooks
      WHERE notebooks.id = notes.notebook_id
      AND notebooks.user_id = auth.uid()
    )
  );

-- Users can update their own notes
CREATE POLICY "Users can update their own notes"
  ON public.notes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.notebooks
      WHERE notebooks.id = notes.notebook_id
      AND notebooks.user_id = auth.uid()
    )
  );

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes"
  ON public.notes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.notebooks
      WHERE notebooks.id = notes.notebook_id
      AND notebooks.user_id = auth.uid()
    )
  );
