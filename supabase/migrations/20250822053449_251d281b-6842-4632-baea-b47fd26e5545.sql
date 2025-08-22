-- Fix database issues and ensure proper authentication flow

-- Create missing trigger for profiles table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create RLS policy for conversations INSERT
CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (buyer_id = auth.uid());

-- Update profiles table to allow proper user creation
ALTER TABLE public.profiles 
ALTER COLUMN id SET DEFAULT auth.uid();

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_seller 
ON public.conversations(buyer_id, seller_id, listing_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON public.messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_listings_seller 
ON public.listings(seller_id, created_at);