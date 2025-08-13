-- 1) Listings table (for product-based chats)
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null,
  title text not null,
  description text,
  price numeric(10,2),
  category text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable RLS and add policies for listings
alter table public.listings enable row level security;

-- Everyone can view listings
create policy if not exists "Listings are viewable by everyone"
  on public.listings for select using (true);

-- Sellers manage their own listings
create policy if not exists "Sellers can insert their own listings"
  on public.listings for insert with check (auth.uid() = seller_id);

create policy if not exists "Sellers can update their own listings"
  on public.listings for update using (auth.uid() = seller_id);

create policy if not exists "Sellers can delete their own listings"
  on public.listings for delete using (auth.uid() = seller_id);

-- updated_at trigger
create trigger if not exists update_listings_updated_at
before update on public.listings
for each row execute function public.update_updated_at_column();

-- 2) Conversations table
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null,
  seller_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint buyer_seller_not_equal check (buyer_id <> seller_id),
  constraint conversations_unique unique (listing_id, buyer_id, seller_id)
);

alter table public.conversations enable row level security;

-- Only members can read/update/delete. No direct INSERT policy (use start_conversation function)
create policy if not exists "Members can select conversations"
  on public.conversations for select using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy if not exists "Members can update conversations"
  on public.conversations for update using (buyer_id = auth.uid() or seller_id = auth.uid());

create policy if not exists "Members can delete conversations"
  on public.conversations for delete using (buyer_id = auth.uid() or seller_id = auth.uid());

create trigger if not exists update_conversations_updated_at
before update on public.conversations
for each row execute function public.update_updated_at_column();

-- 3) Messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

-- Helper function to check membership
create or replace function public.is_conversation_participant(conv_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.conversations c
    where c.id = conv_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
  );
$$;

-- Policies for messages
create policy if not exists "Participants can view messages"
  on public.messages for select using (public.is_conversation_participant(conversation_id));

create policy if not exists "Participants can send messages"
  on public.messages for insert with check (
    public.is_conversation_participant(conversation_id) and sender_id = auth.uid()
  );

-- 4) Function to safely start a conversation for a listing
create or replace function public.start_conversation(p_listing_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller uuid;
  v_buyer uuid := auth.uid();
  v_conv_id uuid;
begin
  if v_buyer is null then
    raise exception 'Not authenticated';
  end if;

  select seller_id into v_seller from public.listings where id = p_listing_id;
  if not found then
    raise exception 'Listing not found';
  end if;

  if v_seller = v_buyer then
    raise exception 'You cannot start a chat with yourself for your own listing';
  end if;

  -- Check for existing conversation
  select id into v_conv_id
  from public.conversations
  where listing_id = p_listing_id and buyer_id = v_buyer and seller_id = v_seller;

  if v_conv_id is not null then
    return v_conv_id;
  end if;

  insert into public.conversations (listing_id, buyer_id, seller_id)
  values (p_listing_id, v_buyer, v_seller)
  returning id into v_conv_id;

  return v_conv_id;
end;
$$;
