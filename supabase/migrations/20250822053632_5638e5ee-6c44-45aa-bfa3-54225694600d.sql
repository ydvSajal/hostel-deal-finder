-- Create RLS policy for conversations INSERT (the missing policy)
CREATE POLICY "Users can create conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (buyer_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_buyer_seller 
ON public.conversations(buyer_id, seller_id, listing_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation 
ON public.messages(conversation_id, created_at);

CREATE INDEX IF NOT EXISTS idx_listings_seller 
ON public.listings(seller_id, created_at);