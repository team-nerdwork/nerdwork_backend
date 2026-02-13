--
-- PostgreSQL database dump
--

\restrict deDpwpdlvZfTzT7Ufzl5j23h3mefxKSmCJWv4gg6kfoTlXkXktrVwUdaWtp6Os4

-- Dumped from database version 17.7 (Debian 17.7-3.pgdg13+1)
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA drizzle;


ALTER SCHEMA drizzle OWNER TO postgres;

--
-- Name: chapter_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.chapter_type AS ENUM (
    'free',
    'paid'
);


ALTER TYPE public.chapter_type OWNER TO postgres;

--
-- Name: comic_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.comic_status_enum AS ENUM (
    'published',
    'pending',
    'scheduled',
    'draft'
);


ALTER TYPE public.comic_status_enum OWNER TO postgres;

--
-- Name: creator_transaction_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.creator_transaction_status AS ENUM (
    'pending',
    'completed',
    'processing',
    'failed'
);


ALTER TYPE public.creator_transaction_status OWNER TO postgres;

--
-- Name: creator_transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.creator_transaction_type AS ENUM (
    'earning',
    'withdrawal',
    'bonus'
);


ALTER TYPE public.creator_transaction_type OWNER TO postgres;

--
-- Name: earning_source; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.earning_source AS ENUM (
    'chapter_purchase',
    'comic_purchase',
    'tip_received',
    'subscription_revenue',
    'platform_bonus'
);


ALTER TYPE public.earning_source OWNER TO postgres;

--
-- Name: listing_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.listing_status AS ENUM (
    'active',
    'sold',
    'cancelled',
    'delisted'
);


ALTER TYPE public.listing_status OWNER TO postgres;

--
-- Name: order_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.order_status AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'failed'
);


ALTER TYPE public.order_status OWNER TO postgres;

--
-- Name: spend_category; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.spend_category AS ENUM (
    'chapter_unlock',
    'comic_purchase',
    'nft_purchase',
    'tip_creator',
    'subscription'
);


ALTER TYPE public.spend_category OWNER TO postgres;

--
-- Name: user_transaction_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_transaction_status AS ENUM (
    'pending',
    'completed',
    'failed',
    'refunded'
);


ALTER TYPE public.user_transaction_status OWNER TO postgres;

--
-- Name: user_transaction_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_transaction_type AS ENUM (
    'purchase',
    'spend',
    'refund'
);


ALTER TYPE public.user_transaction_type OWNER TO postgres;

--
-- Name: wallet_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.wallet_type_enum AS ENUM (
    'solflare',
    'phantom'
);


ALTER TYPE public.wallet_type_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: postgres
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


ALTER TABLE drizzle.__drizzle_migrations OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: postgres
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNER TO postgres;

--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: postgres
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: _drizzle_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._drizzle_migrations (
    id text NOT NULL,
    hash text NOT NULL,
    created_at timestamp without time zone NOT NULL
);


ALTER TABLE public._drizzle_migrations OWNER TO postgres;

--
-- Name: auth_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_sessions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    session_token text NOT NULL,
    refresh_token text NOT NULL,
    ip_address text NOT NULL,
    user_agent text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.auth_sessions OWNER TO postgres;

--
-- Name: auth_users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    username text NOT NULL,
    email_verified boolean DEFAULT false NOT NULL,
    two_factor_enabled boolean DEFAULT false NOT NULL,
    last_login_at timestamp without time zone,
    locked_until timestamp without time zone,
    login_attempts integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.auth_users OWNER TO postgres;

--
-- Name: chapter_comments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapter_comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reader_id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chapter_comments OWNER TO postgres;

--
-- Name: chapter_likes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapter_likes (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reader_id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    viewed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chapter_likes OWNER TO postgres;

--
-- Name: chapter_views; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapter_views (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reader_id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    viewed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chapter_views OWNER TO postgres;

--
-- Name: chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chapters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    chapter_type public.chapter_type DEFAULT 'free'::public.chapter_type NOT NULL,
    price double precision DEFAULT 0 NOT NULL,
    summary text,
    serial_no integer DEFAULT 0 NOT NULL,
    pages text[] NOT NULL,
    chapter_status public.comic_status_enum DEFAULT 'draft'::public.comic_status_enum,
    comic_id uuid NOT NULL,
    unique_code character varying(4) NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.chapters OWNER TO postgres;

--
-- Name: comic_subscribers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comic_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reader_id uuid NOT NULL,
    comic_id uuid NOT NULL,
    subscribed_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comic_subscribers OWNER TO postgres;

--
-- Name: comics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.comics (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title character varying(255) NOT NULL,
    language character varying(50) NOT NULL,
    age_rating character varying(10) NOT NULL,
    no_of_chapters integer DEFAULT 0 NOT NULL,
    no_of_drafts integer DEFAULT 0 NOT NULL,
    description text NOT NULL,
    image_url text NOT NULL,
    comic_status public.comic_status_enum DEFAULT 'draft'::public.comic_status_enum,
    genre text[] NOT NULL,
    tags text[],
    slug character varying(300) NOT NULL,
    creator_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.comics OWNER TO postgres;

--
-- Name: creator_bank_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.creator_bank_details (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid NOT NULL,
    bank_name text NOT NULL,
    account_number text NOT NULL,
    account_name text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.creator_bank_details OWNER TO postgres;

--
-- Name: creator_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.creator_profile (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    creator_name text NOT NULL,
    phone_number text,
    bio text,
    genres text[] DEFAULT '{}'::text[] NOT NULL,
    wallet_type public.wallet_type_enum,
    wallet_address text,
    wallet_balance double precision DEFAULT 0 NOT NULL,
    pin_hash text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.creator_profile OWNER TO postgres;

--
-- Name: creator_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.creator_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    creator_id uuid NOT NULL,
    transaction_type public.creator_transaction_type NOT NULL,
    status public.creator_transaction_status DEFAULT 'pending'::public.creator_transaction_status NOT NULL,
    nwt_amount numeric(10,6) NOT NULL,
    description text NOT NULL,
    earning_source public.earning_source,
    content_id uuid,
    purchaser_user_id uuid,
    source_user_transaction_id uuid,
    gross_amount numeric(10,6),
    platform_fee numeric(10,6),
    platform_fee_percentage numeric(5,4) DEFAULT 0.30,
    withdrawal_method character varying(100),
    withdrawal_address text,
    withdrawal_fee numeric(10,6),
    external_transaction_id character varying(255),
    processed_at timestamp without time zone,
    failure_reason text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.creator_transactions OWNER TO postgres;

--
-- Name: device_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.device_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reader_id uuid NOT NULL,
    token text NOT NULL,
    platform text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.device_tokens OWNER TO postgres;

--
-- Name: library; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.library (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reader_id uuid NOT NULL,
    comic_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.library OWNER TO postgres;

--
-- Name: loyalty_points; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.loyalty_points (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    last_updated timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.loyalty_points OWNER TO postgres;

--
-- Name: marketplace_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketplace_config (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    platform_fee_percentage numeric(5,2) DEFAULT '2'::numeric NOT NULL,
    minimum_listing_price numeric(20,2) DEFAULT '1'::numeric NOT NULL,
    maximum_listing_price numeric(20,2) DEFAULT '1000000'::numeric,
    is_marketplace_active boolean DEFAULT true NOT NULL,
    allow_royalties boolean DEFAULT true NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.marketplace_config OWNER TO postgres;

--
-- Name: marketplace_escrow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marketplace_escrow (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    seller_id uuid NOT NULL,
    total_earnings numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    total_withdrawn numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    available_balance numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.marketplace_escrow OWNER TO postgres;

--
-- Name: nft_listings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nft_listings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nft_id uuid NOT NULL,
    mint_address text NOT NULL,
    seller_id uuid NOT NULL,
    seller_wallet_address text NOT NULL,
    price numeric(20,2) NOT NULL,
    royalty_percentage numeric(5,2) DEFAULT '0'::numeric NOT NULL,
    title text NOT NULL,
    description text,
    status public.listing_status DEFAULT 'active'::public.listing_status NOT NULL,
    listed_at timestamp without time zone DEFAULT now() NOT NULL,
    sold_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.nft_listings OWNER TO postgres;

--
-- Name: nft_marketplace_transfers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nft_marketplace_transfers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    nft_id uuid NOT NULL,
    from_wallet_address text NOT NULL,
    to_wallet_address text NOT NULL,
    transaction_hash text,
    status text NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.nft_marketplace_transfers OWNER TO postgres;

--
-- Name: nft_order_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nft_order_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    buyer_id uuid NOT NULL,
    transaction_type text NOT NULL,
    status text NOT NULL,
    total_amount numeric(20,2) NOT NULL,
    platform_fee_amount numeric(20,2) NOT NULL,
    seller_amount numeric(20,2) NOT NULL,
    royalty_amount numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    description text NOT NULL,
    failure_reason text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.nft_order_transactions OWNER TO postgres;

--
-- Name: nft_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nft_orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    listing_id uuid NOT NULL,
    nft_id uuid NOT NULL,
    mint_address text NOT NULL,
    buyer_id uuid NOT NULL,
    buyer_wallet_address text NOT NULL,
    seller_id uuid NOT NULL,
    seller_wallet_address text NOT NULL,
    purchase_price numeric(20,2) NOT NULL,
    platform_fee_amount numeric(20,2) NOT NULL,
    royalty_amount numeric(20,2) DEFAULT '0'::numeric NOT NULL,
    seller_amount numeric(20,2) NOT NULL,
    transaction_id uuid,
    status public.order_status DEFAULT 'pending'::public.order_status NOT NULL,
    blockchain_tx_hash text,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    cancelled_at timestamp without time zone
);


ALTER TABLE public.nft_orders OWNER TO postgres;

--
-- Name: nft_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nft_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_wallet_id uuid NOT NULL,
    transaction_type text NOT NULL,
    category text NOT NULL,
    amount text NOT NULL,
    balance_before text NOT NULL,
    balance_after text NOT NULL,
    reference_id text,
    reference_type text,
    description text NOT NULL,
    metadata json,
    blockchain_tx_hash text,
    status text NOT NULL,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.nft_transactions OWNER TO postgres;

--
-- Name: nft_transfer_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nft_transfer_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    nft_id uuid NOT NULL,
    from_user_wallet_id uuid,
    to_user_wallet_id uuid NOT NULL,
    from_wallet_address text,
    to_wallet_address text NOT NULL,
    transaction_hash text,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.nft_transfer_history OWNER TO postgres;

--
-- Name: nfts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nfts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_wallet_id uuid NOT NULL,
    collection text,
    nft_type text DEFAULT 'anchor'::text,
    mint_address text,
    price integer DEFAULT 0,
    is_limited_edition boolean DEFAULT false,
    amount integer DEFAULT 1,
    metadata json,
    status text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.nfts OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reader_id uuid NOT NULL,
    type text NOT NULL,
    comic_id uuid,
    chapter_id uuid,
    title text NOT NULL,
    body text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: nwt_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nwt_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_wallet_id uuid NOT NULL,
    transaction_type text NOT NULL,
    category text NOT NULL,
    amount text NOT NULL,
    balance_before text NOT NULL,
    balance_after text NOT NULL,
    reference_id text,
    reference_type text,
    description text NOT NULL,
    metadata json,
    blockchain_tx_hash text,
    status text NOT NULL,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.nwt_transactions OWNER TO postgres;

--
-- Name: paid_Chapters; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."paid_Chapters" (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reader_id uuid NOT NULL,
    chapter_id uuid NOT NULL,
    paid_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public."paid_Chapters" OWNER TO postgres;

--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_resets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.password_resets OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_wallet_id uuid NOT NULL,
    amount text NOT NULL,
    currency text NOT NULL,
    nwt_amount text,
    exchange_rate text,
    webhook_id text,
    payment_intent_id text,
    blockchain_tx_hash text,
    status text NOT NULL,
    failure_reason text,
    metadata json NOT NULL,
    processed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: reader_profile; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reader_profile (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    full_name text NOT NULL,
    genres text[] DEFAULT '{}'::text[] NOT NULL,
    wallet_id character varying(12) NOT NULL,
    wallet_balance double precision DEFAULT 0 NOT NULL,
    pin_hash text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.reader_profile OWNER TO postgres;

--
-- Name: seller_withdrawals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.seller_withdrawals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    seller_id uuid NOT NULL,
    amount numeric(20,2) NOT NULL,
    status text NOT NULL,
    rejection_reason text,
    approved_at timestamp without time zone,
    processed_at timestamp without time zone,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.seller_withdrawals OWNER TO postgres;

--
-- Name: user_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    auth_user_id uuid NOT NULL,
    first_name text,
    last_name text,
    display_name text NOT NULL,
    bio text,
    avatar_url text,
    date_of_birth timestamp without time zone,
    country text,
    timezone text,
    language text NOT NULL,
    preferences json NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_profiles OWNER TO postgres;

--
-- Name: user_transactions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reader_id uuid NOT NULL,
    transaction_type public.user_transaction_type NOT NULL,
    status public.user_transaction_status DEFAULT 'pending'::public.user_transaction_status NOT NULL,
    nwt_amount numeric(10,6) NOT NULL,
    usd_amount numeric(10,2),
    description text NOT NULL,
    spend_category public.spend_category,
    content_id uuid,
    creator_id uuid,
    helio_payment_id character varying(255),
    helio_webhook_id character varying(255),
    blockchain_tx_hash character varying(255),
    metadata jsonb,
    failure_reason text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_transactions OWNER TO postgres;

--
-- Name: user_wallets; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_wallets (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_profile_id uuid NOT NULL,
    nwt_balance integer NOT NULL,
    nwt_locked_balance integer NOT NULL,
    primary_wallet_address text,
    kyc_status text NOT NULL,
    kyc_level integer DEFAULT 0 NOT NULL,
    spending_limit_daily integer,
    spending_limit_monthly integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_wallets OWNER TO postgres;

--
-- Name: wallet_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_wallet_id uuid NOT NULL,
    blockchain text NOT NULL,
    address text NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    label text,
    added_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.wallet_addresses OWNER TO postgres;

--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: postgres
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
1	dda3d0c55ecae8bdf433db0647f8d706afad32bf3a1f5e241dd052e73b48eff9	1767624836527
2	e347e6169dfc9574d5b5a823a3d08347e07bb9900cd5b89db55004a1a8303edb	1768312230756
\.


--
-- Data for Name: _drizzle_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._drizzle_migrations (id, hash, created_at) FROM stdin;
0000_reflective_penance	baseline	2026-01-06 11:20:01.628729
\.


--
-- Data for Name: auth_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_sessions (id, user_id, session_token, refresh_token, ip_address, user_agent, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: auth_users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_users (id, email, username, email_verified, two_factor_enabled, last_login_at, locked_until, login_attempts, is_active, created_at, updated_at) FROM stdin;
533286d4-a228-4f62-9bf6-53006062507f	dev.nerdwork@gmail.com	dev.nerdwork	f	f	\N	\N	0	t	2025-09-29 10:24:25.369729	2025-09-29 10:24:25.369729
27347fd3-4ba1-4aeb-8b55-d601c8a1d4dd	nahrootouzumaki@gmail.com	nahrootouzumaki	f	f	\N	\N	0	t	2025-09-29 10:25:37.778845	2025-09-29 10:25:37.778845
8594bfb4-e524-4e5b-86f2-ba158b0bdd4a	onunworebube3@gmail.com	onunworebube3	f	f	\N	\N	0	t	2025-09-29 11:23:51.881934	2025-09-29 11:23:51.881934
9df9adf7-7eea-4877-920e-2faa8f4a63cf	praisestealth@gmail.com	praisestealth	f	f	\N	\N	0	t	2025-09-29 13:50:01.692808	2025-09-29 13:50:01.692808
e88a5a13-3369-4c11-9640-ff2e5bf71b40	georgewillpraise1@gmail.com	georgewillpraise1	f	f	\N	\N	0	t	2025-09-29 14:27:32.054191	2025-09-29 14:27:32.054191
ad82da70-db6a-402c-9830-1af81790b0e6	pofunwa@gmail.com	pofunwa	f	f	\N	\N	0	t	2025-09-29 14:38:54.461055	2025-09-29 14:38:54.461055
155d1a12-be64-4f8b-b977-be731429e553	georgewillpraise15@gmail.com	georgewillpraise15	f	f	\N	\N	0	t	2025-09-29 14:48:17.373618	2025-09-29 14:48:17.373618
e116ed48-5fb1-4ffe-9445-da666f244896	bennyasitonkajoe@gmail.com	bennyasitonkajoe	f	f	\N	\N	0	t	2025-09-29 15:16:12.342672	2025-09-29 15:16:12.342672
f002b0a8-2b15-4bfe-81d9-42d4ffe43846	baridiloblessingk@gmail.com	baridiloblessingk	f	f	\N	\N	0	t	2025-09-29 20:00:39.465252	2025-09-29 20:00:39.465252
73bacc60-7543-4811-9244-831aad007445	godswilloz0418@gmail.com	godswilloz0418	f	f	\N	\N	0	t	2025-09-29 20:16:12.637429	2025-09-29 20:16:12.637429
c1c1fefb-93e1-4057-89d0-d5bf3d0e4c88	vic.ezealor@gmail.com	vic.ezealor	f	f	\N	\N	0	t	2025-09-30 21:16:48.123341	2025-09-30 21:16:48.123341
cd9c659b-5b47-4d2f-aa4c-af151f4943aa	annonny234@gmail.com	annonny234	f	f	\N	\N	0	t	2025-10-01 08:50:12.883165	2025-10-01 08:50:12.883165
b34c0cf0-f41b-4788-ad98-f4d2419559cf	ayomikun0x.dev@gmail.com	ayomikun0x.dev	f	f	\N	\N	0	t	2025-10-01 12:29:39.795578	2025-10-01 12:29:39.795578
a8f6dea1-b805-490c-aa77-1f063ecc3de4	makioedesemi@gmail.com	makioedesemi	f	f	\N	\N	0	t	2025-10-01 20:41:14.393222	2025-10-01 20:41:14.393222
77dfae30-b9be-412f-bc68-f286e6f45a1b	jessie2y23@gmail.com	jessie2y23	f	f	\N	\N	0	t	2025-10-02 08:25:16.848075	2025-10-02 08:25:16.848075
d905c6ee-b25e-4a7a-82ff-f277539f863a	chikwev@gmail.com	chikwev	f	f	\N	\N	0	t	2025-10-02 09:11:38.97719	2025-10-02 09:11:38.97719
e7575adb-20d0-426d-9c68-b5337f34a1d6	imp.c.sol.invictvs.avg@gmail.com	imp.c.sol.invictvs.avg	f	f	\N	\N	0	t	2025-10-02 09:41:01.165688	2025-10-02 09:41:01.165688
2c648bb3-5ddb-4342-96b1-6442501aa481	divasolitude@gmail.com	divasolitude	f	f	\N	\N	0	t	2025-10-02 16:33:55.408088	2025-10-02 16:33:55.408088
030987ef-ce97-479e-9c8a-c7f8f5a62d8c	atomicisnoah.code@gmail.com	atomicisnoah.code	f	f	\N	\N	0	t	2025-10-02 17:13:59.956604	2025-10-02 17:13:59.956604
89e1ad68-8844-499e-932d-dcf214fdc5b2	petraalare@gmail.com	petraalare	f	f	\N	\N	0	t	2025-10-02 20:54:27.67156	2025-10-02 20:54:27.67156
06000057-f0f9-46fc-94da-049fb30c921d	kingtobiloba133@gmail.com	kingtobiloba133	f	f	\N	\N	0	t	2025-10-02 21:08:27.511649	2025-10-02 21:08:27.511649
8397f236-2a25-4c83-b2b8-8ab3d503bac5	cuiselpeach@gmail.com	cuiselpeach	f	f	\N	\N	0	t	2025-10-03 21:27:19.879724	2025-10-03 21:27:19.879724
39ee6cef-d517-4c64-8f47-c53d8b78c577	jacksongodwinking@gmail.com	jacksongodwinking	f	f	\N	\N	0	t	2025-10-03 21:27:20.273793	2025-10-03 21:27:20.273793
8d1b9e63-b33c-4a18-b37e-cb29b8acd24b	franklinonuemenachi@gmail.com	franklinonuemenachi	f	f	\N	\N	0	t	2025-10-04 12:25:27.108033	2025-10-04 12:25:27.108033
d42fb868-991a-43b3-b197-0291debc1722	danielanders222@gmail.com	danielanders222	f	f	\N	\N	0	t	2025-10-04 12:50:16.027953	2025-10-04 12:50:16.027953
291f1cea-5ecb-4fa4-82c2-f78218f14f31	temialabi1477@gmail.com	temialabi1477	f	f	\N	\N	0	t	2025-10-04 20:53:05.679193	2025-10-04 20:53:05.679193
bfc297a7-19c7-4459-ae68-9c0c619525c2	amyechezona@gmail.com	amyechezona	f	f	\N	\N	0	t	2025-10-05 09:48:18.719124	2025-10-05 09:48:18.719124
1d02c390-3b1b-441c-9299-b5996da32f5c	edwardthecartoonist@gmail.com	edwardthecartoonist	f	f	\N	\N	0	t	2025-10-05 15:03:43.40999	2025-10-05 15:03:43.40999
6aca96ae-ed48-4b6c-9bb8-3ec999c6b8e0	ayomikuntemitope246@gmail.com	ayomikuntemitope246	f	f	\N	\N	0	t	2025-10-07 08:07:49.344137	2025-10-07 08:07:49.344137
d4fa0737-edff-491c-a339-c690a9f66cd8	eziijude@gmail.com	eziijude	f	f	\N	\N	0	t	2025-10-07 09:48:17.601872	2025-10-07 09:48:17.601872
2a46b96d-03e2-46f6-ba99-be45cf370b20	dsionan104@gmail.com	dsionan104	f	f	\N	\N	0	t	2025-10-07 11:01:02.105083	2025-10-07 11:01:02.105083
ee082cd4-0961-4f51-98c9-5fc6f423a449	giddycodes@gmail.com	giddycodes	f	f	\N	\N	0	t	2025-10-07 16:23:23.327847	2025-10-07 16:23:23.327847
8e09069f-e168-4cec-b1e9-1714e99da95e	vuzoma9@gmail.com	vuzoma9	f	f	\N	\N	0	t	2025-10-07 19:44:37.826186	2025-10-07 19:44:37.826186
dc956caa-d5de-4a49-8561-7a2286d9dddb	webxviolet@gmail.com	webxviolet	f	f	\N	\N	0	t	2025-10-07 22:12:47.20858	2025-10-07 22:12:47.20858
f3b808fb-d5f1-4b85-85ad-9c9802d1016c	marvellosamuel085@gmail.com	marvellosamuel085	f	f	\N	\N	0	t	2025-10-08 13:37:16.081976	2025-10-08 13:37:16.081976
4109756c-ca32-4bd3-9d06-56d5f98c0d96	anomfuemedaniel@gmail.com	anomfuemedaniel	f	f	\N	\N	0	t	2025-10-08 17:06:27.191167	2025-10-08 17:06:27.191167
b73dc977-85a8-4141-8a2e-edb3b2465086	ileemmanuel22@gmail.com	ileemmanuel22	f	f	\N	\N	0	t	2025-10-08 21:41:59.654493	2025-10-08 21:41:59.654493
67ade92d-92ec-407c-8020-6a24e2fd4414	philip.c.alare@gmail.com	philip.c.alare	f	f	\N	\N	0	t	2025-10-09 14:23:07.895297	2025-10-09 14:23:07.895297
e199fa9f-308e-4004-9abc-92a3a1adaf01	newprymeentertainment@gmail.com	newprymeentertainment	f	f	\N	\N	0	t	2025-10-09 14:35:01.515145	2025-10-09 14:35:01.515145
701e0154-4d41-46f0-83c9-8583c6c054a6	ruktheradiant@gmail.com	ruktheradiant	f	f	\N	\N	0	t	2025-10-10 11:29:07.654878	2025-10-10 11:29:07.654878
5de4c82e-a30b-46d6-99cc-6f9b13962b70	thedosdee@gmail.com	thedosdee	f	f	\N	\N	0	t	2025-10-10 19:41:11.40456	2025-10-10 19:41:11.40456
34c0211b-db59-4521-94bb-5601535ad074	ejiro45@gmail.com	ejiro45	f	f	\N	\N	0	t	2025-10-10 20:09:59.945202	2025-10-10 20:09:59.945202
a209d492-a47f-4b00-a2f4-e5a44acc3130	mailserveroperators@gmail.com	mailserveroperators	f	f	\N	\N	0	t	2025-10-11 00:58:00.300183	2025-10-11 00:58:00.300183
99192e36-b64b-4f3b-9eb1-9917cdaf8e1d	salvatorejason7@gmail.com	salvatorejason7	f	f	\N	\N	0	t	2025-10-11 07:49:59.899366	2025-10-11 07:49:59.899366
9a825b78-2c74-4348-b53e-558747d1cdce	gbadeboabdulsamad@gmail.com	gbadeboabdulsamad	f	f	\N	\N	0	t	2025-10-11 08:53:39.901342	2025-10-11 08:53:39.901342
8011f220-2e94-4869-9d75-ea79ab394638	princeukoh509@gmail.com	princeukoh509	f	f	\N	\N	0	t	2025-10-11 10:35:06.103229	2025-10-11 10:35:06.103229
ebb03d8f-2f05-4e8b-9eee-51138d02928d	raji.mahmud.a@gmail.com	raji.mahmud.a	f	f	\N	\N	0	t	2025-10-11 12:37:31.119211	2025-10-11 12:37:31.119211
7fd9c303-9a9e-45ec-af47-f1f09bb6deb8	rubyroyce446@gmail.com	rubyroyce446	f	f	\N	\N	0	t	2025-10-11 13:22:07.39448	2025-10-11 13:22:07.39448
018b3df0-8716-43de-9e3a-d371710346b6	muhammedbashir384@gmail.com	muhammedbashir384	f	f	\N	\N	0	t	2025-10-11 14:02:52.472063	2025-10-11 14:02:52.472063
f4f5c654-0c05-4963-905b-00cd4bbd7ca4	yhungdew@gmail.com	yhungdew	f	f	\N	\N	0	t	2025-10-11 14:22:48.273747	2025-10-11 14:22:48.273747
6bd79aef-c6ce-4f35-8f49-c71f66fabdf1	josepholaniyi820@gmail.com	josepholaniyi820	f	f	\N	\N	0	t	2025-10-11 14:32:47.675989	2025-10-11 14:32:47.675989
2e927d9e-75d6-4119-8a08-3a144b726fed	calebwodi33@gmail.com	calebwodi33	f	f	\N	\N	0	t	2025-10-11 16:21:48.282409	2025-10-11 16:21:48.282409
393035b6-0ed8-4b63-824e-da0010d24ab7	nosakharay@gmail.com	nosakharay	f	f	\N	\N	0	t	2025-10-11 16:45:26.246852	2025-10-11 16:45:26.246852
61d7909d-a5dc-4b26-834f-8f7104c6330b	elumezeemma@gmail.com	elumezeemma	f	f	\N	\N	0	t	2025-10-11 17:23:43.930586	2025-10-11 17:23:43.930586
7d05d8e3-af7d-4c2f-8418-853fc1d854c0	samuelifeoluwa66@gmail.com	samuelifeoluwa66	f	f	\N	\N	0	t	2025-10-11 17:30:47.30635	2025-10-11 17:30:47.30635
fbf3130a-7016-409e-844b-a89272bcbcee	abdulqaharolajide@gmail.com	abdulqaharolajide	f	f	\N	\N	0	t	2025-10-11 18:10:54.121204	2025-10-11 18:10:54.121204
4ee98256-5010-45e4-9036-983857a33248	abdulrahmon11052008@gmail.com	abdulrahmon11052008	f	f	\N	\N	0	t	2025-10-11 18:38:45.998955	2025-10-11 18:38:45.998955
810d8b96-d4b6-4412-b2c8-a1942038d29a	opeyemioluwafisayo29@gmail.com	opeyemioluwafisayo29	f	f	\N	\N	0	t	2025-10-11 18:47:02.477837	2025-10-11 18:47:02.477837
e4b8ab68-6d78-437f-becc-eccf3cb1b853	abiadeabdulazeez@gmail.com	abiadeabdulazeez	f	f	\N	\N	0	t	2025-10-11 19:41:21.085081	2025-10-11 19:41:21.085081
6b1ad98f-c58d-4cf9-9809-580eea6aaca2	ezekielojochenemi28@gmail.com	ezekielojochenemi28	f	f	\N	\N	0	t	2025-10-11 22:09:50.860663	2025-10-11 22:09:50.860663
4a5d51fc-ebd5-48cb-8c77-1e393573412c	sulaimontobilobaabayomi@gmail.com	sulaimontobilobaabayomi	f	f	\N	\N	0	t	2025-10-12 05:49:06.513903	2025-10-12 05:49:06.513903
1874f1f6-fca3-4f41-bd86-30e6e3368a28	utcomicstm@gmail.com	utcomicstm	f	f	\N	\N	0	t	2025-10-12 11:52:38.055598	2025-10-12 11:52:38.055598
8070a9c6-1f31-44a5-b90b-90b31ab9abd1	toptekng@gmail.com	toptekng	f	f	\N	\N	0	t	2025-10-12 12:50:16.882081	2025-10-12 12:50:16.882081
dd402d62-e49e-411b-a9a2-294472cc0e67	worgubelieve@gmail.com	worgubelieve	f	f	\N	\N	0	t	2025-10-13 09:42:49.106783	2025-10-13 09:42:49.106783
fba76982-704d-4e0a-a547-188739962609	veraiwuagwu2001@gmail.com	veraiwuagwu2001	f	f	\N	\N	0	t	2025-10-16 05:58:25.464834	2025-10-16 05:58:25.464834
dd97a64c-86fe-4ec8-8f48-8403b0784729	jasminearomaegbe@gmail.com	jasminearomaegbe	f	f	\N	\N	0	t	2025-10-16 18:19:33.03238	2025-10-16 18:19:33.03238
3eb0a7c0-b23d-496f-83a4-436ba285b679	haryoelijah@gmail.com	haryoelijah	f	f	\N	\N	0	t	2025-10-18 07:57:58.343658	2025-10-18 07:57:58.343658
dcec92a4-4fb9-4ff2-b0d0-107801380271	diggie.d.scribe@gmail.com	diggie.d.scribe	f	f	\N	\N	0	t	2025-10-18 08:09:14.269806	2025-10-18 08:09:14.269806
a0ce8c26-5318-4c0b-8291-f83536100011	inmaginnationz@gmail.com	inmaginnationz	f	f	\N	\N	0	t	2025-10-18 08:22:42.0607	2025-10-18 08:22:42.0607
f7f7930c-178c-4da8-b31b-9c6be4b53ca4	purplyakuza@gmail.com	purplyakuza	f	f	\N	\N	0	t	2025-10-18 08:27:08.642956	2025-10-18 08:27:08.642956
424cc417-d81b-4582-8616-b3cffd4e977a	bechikingston@gmail.com	bechikingston	f	f	\N	\N	0	t	2025-10-18 08:30:01.799793	2025-10-18 08:30:01.799793
c34b21d2-d9e0-4ef7-800f-2347eaec244b	blossomtheauthor@gmail.com	blossomtheauthor	f	f	\N	\N	0	t	2025-10-18 08:36:51.392018	2025-10-18 08:36:51.392018
7c849698-abb7-4b5e-a07f-c3571a1c5b2a	harryafiegha1995@gmail.com	harryafiegha1995	f	f	\N	\N	0	t	2025-10-18 08:43:24.567779	2025-10-18 08:43:24.567779
9043c393-c9f5-4f8e-8aae-14d295d2e2e3	vidz281988@gmail.com	vidz281988	f	f	\N	\N	0	t	2025-10-18 09:41:17.402485	2025-10-18 09:41:17.402485
4d756bf6-e819-486b-ad9c-34af8af8aa2e	fayborah@gmail.com	fayborah	f	f	\N	\N	0	t	2025-10-18 09:47:48.86563	2025-10-18 09:47:48.86563
ae92d788-d289-47bd-b5f9-8b858508422e	desart910@gmail.com	desart910	f	f	\N	\N	0	t	2025-10-18 10:10:30.548083	2025-10-18 10:10:30.548083
d4210ab4-ddaa-45d1-ada1-9c710e1a54e3	cchiorlu.v@gmail.com	cchiorlu.v	f	f	\N	\N	0	t	2025-10-18 15:20:16.770531	2025-10-18 15:20:16.770531
deddfdbe-22e9-48cf-b651-fdfeeb294624	amiso.praiise@gmail.com	amiso.praiise	f	f	\N	\N	0	t	2025-10-19 06:09:54.239594	2025-10-19 06:09:54.239594
47d27230-b061-4dcf-bb47-9813d2a673f1	jewellaniek@gmail.com	jewellaniek	f	f	\N	\N	0	t	2025-10-19 08:25:52.639439	2025-10-19 08:25:52.639439
6ff6cde8-b10c-4d34-b696-5837a993eb7a	dihesi8@gmail.com	dihesi8	f	f	\N	\N	0	t	2025-10-19 14:31:57.450303	2025-10-19 14:31:57.450303
0f7087ff-a446-4b2c-9383-491c96d32cf6	doeffiong@gmail.com	doeffiong	f	f	\N	\N	0	t	2025-10-20 01:27:27.426084	2025-10-20 01:27:27.426084
650a188b-a51f-4c9e-8834-2e3021423d0e	marvinsunday7000@gmail.com	marvinsunday7000	f	f	\N	\N	0	t	2025-10-20 19:19:46.941522	2025-10-20 19:19:46.941522
97a38989-589f-4136-9509-90a65314612b	favournnaemeka32@gmail.com	favournnaemeka32	f	f	\N	\N	0	t	2025-10-20 22:40:33.927972	2025-10-20 22:40:33.927972
e30b3666-d77b-4a8e-8514-ff138c9d844f	blessingikoro5@gmail.com	blessingikoro5	f	f	\N	\N	0	t	2025-10-20 22:45:34.348653	2025-10-20 22:45:34.348653
57ba8a82-1c2b-4a62-a3b8-9e01e780c3ab	harrywealth16@gmail.com	harrywealth16	f	f	\N	\N	0	t	2025-10-21 13:24:06.098929	2025-10-21 13:24:06.098929
6a1290d4-ac65-4720-a320-c2d9b3ff7ae5	okanduchiomablessing@gmail.com	okanduchiomablessing	f	f	\N	\N	0	t	2025-10-23 13:13:58.443797	2025-10-23 13:13:58.443797
27f69dea-1159-461d-8ce8-661147c7d7ae	udonnachukwuemeka@gmail.com	udonnachukwuemeka	f	f	\N	\N	0	t	2025-10-23 20:37:04.711775	2025-10-23 20:37:04.711775
17bcc118-320b-4587-8d8d-99b34bd92ea1	osikaboremmanuel@gmail.com	osikaboremmanuel	f	f	\N	\N	0	t	2025-10-25 12:18:40.446105	2025-10-25 12:18:40.446105
29245c6e-8546-41d8-9642-8cabae46f24a	gozuem26@gmail.com	gozuem26	f	f	\N	\N	0	t	2025-10-25 12:27:31.095716	2025-10-25 12:27:31.095716
c2bb4080-ea2f-42db-a08f-d155e67f8cff	bryteokk@gmail.com	bryteokk	f	f	\N	\N	0	t	2025-10-25 19:42:14.393701	2025-10-25 19:42:14.393701
a347c899-6600-4829-9844-66e13a29c291	praisegeorgewill4@gmail.com	praisegeorgewill4	f	f	\N	\N	0	t	2025-10-30 21:33:01.41136	2025-10-30 21:33:01.41136
f972d792-5615-4f8f-9830-261749132640	danbrown517@gmail.com	danbrown517	f	f	\N	\N	0	t	2025-10-31 21:06:58.904221	2025-10-31 21:06:58.904221
f5c2f71c-f7d7-41ec-bec1-694be82331d9	mfrancis248@gmail.com	mfrancis248	f	f	\N	\N	0	t	2025-11-02 08:36:22.56858	2025-11-02 08:36:22.56858
a7e226ae-b30b-486e-a03d-caa1076a9760	ugbeadie3@gmail.com	ugbeadie3	f	f	\N	\N	0	t	2025-11-03 10:00:06.842903	2025-11-03 10:00:06.842903
f28496c5-fb09-4103-8d72-ec520f8205dc	gozzzy21@gmail.com	gozzzy21	f	f	\N	\N	0	t	2025-11-03 12:57:33.219654	2025-11-03 12:57:33.219654
ed2c5df8-0fb9-4f02-a1e5-2f771681ee02	oshintomisin@gmail.com	oshintomisin	f	f	\N	\N	0	t	2025-11-03 14:38:40.729079	2025-11-03 14:38:40.729079
4fcbf50d-030f-40ff-be49-db8645529446	omizu929@gmail.com	omizu929	f	f	\N	\N	0	t	2025-11-03 21:57:07.664129	2025-11-03 21:57:07.664129
5b63220f-ef25-4a6a-9618-64aef8306f8e	ekehsgame@gmail.com	ekehsgame	f	f	\N	\N	0	t	2025-11-04 06:28:26.35092	2025-11-04 06:28:26.35092
4980079a-60d4-4c25-be6b-12440582f99d	oyinkuroatani@gmail.com	oyinkuroatani	f	f	\N	\N	0	t	2025-11-04 10:00:51.351099	2025-11-04 10:00:51.351099
f3f74ec9-df88-4649-942a-45fdad1eb2f8	cristadavis1369@gmail.com	cristadavis1369	f	f	\N	\N	0	t	2025-11-04 17:13:22.925099	2025-11-04 17:13:22.925099
10f2ba18-543b-4d7e-8774-ee3e2b2d564d	grahamdouglasshawn@gmail.com	grahamdouglasshawn	f	f	\N	\N	0	t	2025-11-06 13:00:38.408246	2025-11-06 13:00:38.408246
a4d4baf7-5c03-4116-a0e5-cbfffbe6c071	cechiorlu@gmail.com	cechiorlu	f	f	\N	\N	0	t	2025-11-08 09:32:43.803004	2025-11-08 09:32:43.803004
3f91f97b-0177-4679-88c2-6c7277a037da	mochaeldonald1@gmail.com	mochaeldonald1	f	f	\N	\N	0	t	2025-11-10 10:45:38.323527	2025-11-10 10:45:38.323527
5b3c9424-a44e-4b60-8e03-4e61eb9799e4	mayambamaxwell@gmail.com	mayambamaxwell	f	f	\N	\N	0	t	2025-11-10 10:46:16.000744	2025-11-10 10:46:16.000744
e2930a43-76aa-4b0c-b373-a6551e91e0e0	ataniw99@gmail.com	ataniw99	f	f	\N	\N	0	t	2025-11-14 18:35:39.278212	2025-11-14 18:35:39.278212
f266fd42-1603-4e44-b0d4-07870510fcd6	missyjerry.d@gmail.com	missyjerry.d	f	f	\N	\N	0	t	2025-11-15 07:16:55.792983	2025-11-15 07:16:55.792983
58d876c4-380e-413b-a62e-b1e4b9db4477	enchantergreg@gmail.com	enchantergreg	f	f	\N	\N	0	t	2025-11-22 12:30:52.415546	2025-11-22 12:30:52.415546
e22ea3ae-2198-4888-b08a-3ed6b81e4560	jasonanudu@gmail.com	jasonanudu	f	f	\N	\N	0	t	2025-11-22 18:35:14.369048	2025-11-22 18:35:14.369048
4a835203-e4cc-4f68-bc55-d61c1595a7a8	emmadaviscypher@gmail.com	emmadaviscypher	f	f	\N	\N	0	t	2025-11-22 20:51:23.781366	2025-11-22 20:51:23.781366
ee9b56b1-cae8-4fb1-bcdc-a97510e0b6f0	adahebenezer02@gmail.com	adahebenezer02	f	f	\N	\N	0	t	2026-01-28 19:36:00.201004	2026-01-28 19:36:00.201004
\.


--
-- Data for Name: chapter_comments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chapter_comments (id, reader_id, chapter_id, content, created_at, updated_at) FROM stdin;
cfd88fc8-5c70-493f-9e76-532be9537329	d72bb5b0-e689-4084-96ce-4d3535e3ec42	4b66ee57-a8f6-40e4-9880-501efb9526e7	This chapter was insane 🔥	2026-01-09 21:05:03.783678	2026-01-09 21:05:03.783678
82831e2d-6823-4655-8a40-b9fe61c5230e	d72bb5b0-e689-4084-96ce-4d3535e3ec42	4b66ee57-a8f6-40e4-9880-501efb9526e7	Can't wait for the next chapter.	2026-01-09 21:09:55.975945	2026-01-09 21:09:55.975945
414687f5-a2ea-4b64-a9ac-9206403d11fd	d72bb5b0-e689-4084-96ce-4d3535e3ec42	c3b9aca3-2275-41a8-91ff-a10e8417ff10	Wow. That was a way to start of.\nCan't wait.	2026-01-10 05:48:01.376882	2026-01-10 05:48:01.376882
9fa0ba16-51be-4eb9-bed9-b746d40c3aa5	d72bb5b0-e689-4084-96ce-4d3535e3ec42	2438277c-ff34-4ca4-b25f-a958429e657b	Niceee.	2026-01-10 07:20:45.842685	2026-01-10 07:20:45.842685
b8b66d30-672a-4cd7-94e3-89d8709f0d8d	f9768ec1-279c-4038-a426-f3f960099759	4b66ee57-a8f6-40e4-9880-501efb9526e7	Cool stuff	2026-01-10 07:33:54.160712	2026-01-10 07:33:54.160712
f1ea07ba-85ba-4645-838a-92a2cd50df29	f9768ec1-279c-4038-a426-f3f960099759	2d7897f0-df02-4369-b6f3-04de75a319a1	Pretty interesting stuffs 	2026-01-10 07:45:15.255802	2026-01-10 07:45:15.255802
b4dbb903-95bc-45af-aaf0-86eed1e400f0	9cca51b0-fd9c-410b-a2b7-12013fa9fac2	4b66ee57-a8f6-40e4-9880-501efb9526e7	Test comment from verify script	2026-01-21 11:53:44.028517	2026-01-21 11:53:44.028517
9613e606-d042-4bab-b22f-f394ac10507e	9cca51b0-fd9c-410b-a2b7-12013fa9fac2	4b66ee57-a8f6-40e4-9880-501efb9526e7	Test comment from verify script	2026-01-21 11:55:50.09539	2026-01-21 11:55:50.09539
\.


--
-- Data for Name: chapter_likes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chapter_likes (id, reader_id, chapter_id, viewed_at) FROM stdin;
711ea5fe-d8f9-4aad-9205-a8ffc19f8536	887e566e-b448-4538-bf89-d8d1e0a7128d	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-02 20:31:51.065324
dc399f3c-b27e-47c2-92a4-a3832c601470	77e74237-5a5a-4b36-acc6-59b245da323b	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-03 21:32:43.763112
5eded088-17ee-4ea5-a7e3-02739e87c4b4	78ed4151-5647-4b0a-afc1-1e7ffcde3615	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-04 20:55:14.141593
98973c20-5366-4c96-b96c-1baf3ccbb06b	7541c1d4-d31b-4e58-a664-cb5d38e4e6b6	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-05 16:02:51.607319
a626c289-3f1a-41cc-9210-fb4a2119ceb3	7541c1d4-d31b-4e58-a664-cb5d38e4e6b6	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-07 11:16:43.798936
bda4094f-cd52-4152-8ba0-d816d12abb15	76f72226-942d-4438-857a-e9ddf2f37034	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-09 14:26:11.181551
fe82b41c-971f-4a85-aa31-a12fde1f1ac8	ac69ae8a-c771-4b8f-9fc0-be49daaee356	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 10:40:08.51937
48da6569-131a-4619-97d3-bb3c9941782f	0c1864a3-851b-4a76-8f19-b9c82c199264	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-11 12:40:01.485696
4dcf0130-440d-42f0-a656-99456a5e880d	39b52168-3277-404c-89e6-caa673db7451	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 14:23:39.149007
90552f9c-032f-48dd-a669-149189136f40	acf4dd3b-fe86-400a-9525-e3b77e89b808	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-11 22:12:11.228232
bd1d8c69-414d-440f-bda7-a1c70098a30d	acf4dd3b-fe86-400a-9525-e3b77e89b808	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 22:13:37.50755
718d8984-561d-4e09-8e25-410750250e1a	79a8efb7-e8ea-4eb9-99b1-0b2cd288df04	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-11 22:20:21.934659
83531615-c745-42f1-b773-646996ce06f4	79a8efb7-e8ea-4eb9-99b1-0b2cd288df04	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 22:33:35.78584
84b9c3a3-e9aa-47ec-af37-a7e4eff8709a	dd4c9ad9-7c1d-4aa8-8849-6db6026ee2f7	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-12 05:50:03.366605
1c7ec67c-5b57-47f9-bb8c-09ffec4c321a	e4b02423-5164-471c-b102-faf493f5a041	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-12 12:51:06.877046
6ca3ceb6-d788-4e9c-a97d-8267862e35c0	e4b02423-5164-471c-b102-faf493f5a041	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-12 12:59:10.945551
817a053b-a32a-4ca2-8743-20db580ff6ef	d72bb5b0-e689-4084-96ce-4d3535e3ec42	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-17 08:06:37.147938
1e358983-4a31-4c09-9928-c92a6c471574	3cbad6c2-2c3f-4786-ab99-26752e680a07	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-18 08:29:29.490444
087717ec-a352-4e32-8353-6d4e1067bb60	7d22c452-8903-4b70-8a81-6efc5fdcc386	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-03 16:09:53.221584
08983479-1124-4a82-bea0-3e3eca13f537	b13e0d32-3ca7-4922-8f38-29a8325b7f0b	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-03 23:08:57.827145
24991722-ad60-45ec-883e-b81d37ed5954	7eb822b8-b951-4f68-928a-c607c7f2ffb5	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-04 10:02:44.465929
eed7b7bb-640a-4c7a-b949-0a961dcc5f61	36847d5a-dd9b-4463-ac3e-4a34c0269623	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-11-04 13:54:18.828238
a4d200ae-5d91-4cfd-a7ae-420572cc7092	36847d5a-dd9b-4463-ac3e-4a34c0269623	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-04 14:02:04.429822
a6d92183-09c2-4f78-bed6-1568b61dfb0d	4b338dcc-6ab6-4e44-96a2-b2b1475c6b3b	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-11-10 10:51:47.698886
a908de4f-4240-41ba-b0a9-8c57bc65438d	4b338dcc-6ab6-4e44-96a2-b2b1475c6b3b	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-11-10 10:54:08.820808
975f0dc7-c661-4672-ba0c-72015d2ecf90	ac69ae8a-c771-4b8f-9fc0-be49daaee356	1502e68c-4834-4c69-ac99-5eccd058707f	2025-11-16 09:41:11.632463
09e857e9-460d-4ca6-be8e-ef987e0d0759	f9768ec1-279c-4038-a426-f3f960099759	2438277c-ff34-4ca4-b25f-a958429e657b	2026-01-08 11:50:20.797546
2051635e-0feb-4930-9eb5-16c9584cbb98	f9768ec1-279c-4038-a426-f3f960099759	4b66ee57-a8f6-40e4-9880-501efb9526e7	2026-01-10 07:34:08.641043
ddcec0f3-c40f-4c61-891f-f0cd5f54bef8	f9768ec1-279c-4038-a426-f3f960099759	2d7897f0-df02-4369-b6f3-04de75a319a1	2026-01-10 07:45:02.662355
312982d1-e5d1-4ea8-90e9-e735b6ae6405	16baa92c-5f91-4b82-a796-1f619ea07141	4b66ee57-a8f6-40e4-9880-501efb9526e7	2026-01-11 16:48:37.334663
95348afb-c32b-4f05-9d12-d400e6de37ef	f9768ec1-279c-4038-a426-f3f960099759	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2026-01-15 14:52:55.692956
a65fc1d4-6577-4686-bc71-ed10ac759014	d72bb5b0-e689-4084-96ce-4d3535e3ec42	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2026-01-24 18:32:47.605483
\.


--
-- Data for Name: chapter_views; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chapter_views (id, reader_id, chapter_id, viewed_at) FROM stdin;
0eaff621-a633-4861-b0d8-f7ae097c010c	f9768ec1-279c-4038-a426-f3f960099759	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-02 20:24:06.757897
fc9642a0-ed30-4f14-884f-c83038fa4368	887e566e-b448-4538-bf89-d8d1e0a7128d	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-02 20:30:13.13801
5266110c-03f1-4563-82fb-90f953ee704a	7541c1d4-d31b-4e58-a664-cb5d38e4e6b6	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-02 20:38:09.738821
84630527-e0ee-4606-aaac-a44cae233d41	c0eab1f0-1fd1-4152-a263-1933a0a35c13	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-02 20:55:49.342769
c47688f5-220f-4e43-9a9f-3aa0994e4d39	9cca51b0-fd9c-410b-a2b7-12013fa9fac2	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-03 08:44:35.936353
a97cf2c2-e543-49a1-bfea-618fa17a24e2	77e74237-5a5a-4b36-acc6-59b245da323b	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-03 21:28:46.351296
4953d503-419e-47e1-a507-3757497d9729	6dc2bbc4-0066-43b4-abff-0d152a182e78	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-04 12:52:41.876869
202b9569-efae-4695-abad-957c4156eb4f	78ed4151-5647-4b0a-afc1-1e7ffcde3615	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-04 20:54:46.322476
b0c50db9-1e1c-4f33-ac61-d884df27a99d	ce45aeac-e832-436a-8beb-6eef0709e061	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-05 09:48:47.406355
56d073df-1cd6-45d8-b7c8-85b526cb5919	3255b0bf-719d-4203-83f2-1489bbaf7b1c	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-05 15:05:44.984031
ea372abf-82e5-4e14-b1a5-efee101deaa9	d72bb5b0-e689-4084-96ce-4d3535e3ec42	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-06 15:39:15.754177
387b4293-9aac-4fc3-a2f6-93cb92abc2dd	7541c1d4-d31b-4e58-a664-cb5d38e4e6b6	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-07 11:15:54.722988
77fe9412-8319-42f0-8b71-58bdb95bcdf2	d72bb5b0-e689-4084-96ce-4d3535e3ec42	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-07 16:04:31.729676
c076e910-2829-40a1-858b-9d0aebeb1042	7541c1d4-d31b-4e58-a664-cb5d38e4e6b6	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-07 16:23:21.793015
f13dabdc-f181-4c68-833f-42374d2a559d	b12ad82b-4951-4be8-b10d-33cde4e5632b	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-07 16:25:13.570827
3186145b-a7f8-454c-889c-7cb1ad6eff03	b12ad82b-4951-4be8-b10d-33cde4e5632b	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-07 16:26:00.55693
7db33e7f-2f7a-40b8-9026-94be1c37c9ce	e577cae2-d005-43ed-8a7f-f9573fa95509	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-07 19:50:24.493538
38d4b49b-bc0f-4ac3-8fd6-97b427ac026b	f9768ec1-279c-4038-a426-f3f960099759	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-08 06:12:02.091146
e4f7daf3-6c04-469f-a172-1b097d9c7a33	f9768ec1-279c-4038-a426-f3f960099759	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-08 06:12:36.189557
f492aeda-7dea-4269-bce9-43b61b369a7e	3127d939-6acc-40bf-a4c7-338706691f04	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-08 13:39:20.459307
06283d90-a788-43d6-b55d-3fe021dfe7c3	3127d939-6acc-40bf-a4c7-338706691f04	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-08 13:40:15.315435
103ec730-2e93-45fb-932a-e0502fbc9496	0eea9054-b7a7-474d-839d-aed4ff75acd8	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-08 17:08:14.72968
b5800918-2c62-454d-8d8b-def234125f18	011f101a-319a-40ca-ab4a-d3c5e95aacb3	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-08 21:43:48.024985
0f346212-89b0-48b7-9f55-4917126ca2f7	76f72226-942d-4438-857a-e9ddf2f37034	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-09 14:25:22.947909
9317bdf7-4459-4624-a1fd-74a18d520686	2e7c8379-bef6-4ab8-acef-9cc445bdefc5	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-10 11:37:37.388126
bee9e1c4-67b4-4a67-9d61-e540021b9b77	887e566e-b448-4538-bf89-d8d1e0a7128d	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-10 13:35:34.756204
37d311b7-54b1-43f3-8f38-ee6b0b721af9	23386f69-0ed6-477f-8a27-4c8c68c6479e	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-10 20:11:27.79437
a2829ad0-4f65-425d-ab86-a632b267e29f	7541c1d4-d31b-4e58-a664-cb5d38e4e6b6	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-10 20:43:20.22351
5eec4ae9-8521-492f-a757-f0af8b7e5101	efb92a10-acc7-43c0-b8f8-f40c114265fa	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-10 21:10:44.712211
10698eed-090e-48a5-bff2-a0bb063d0a83	f4dfa2bb-18e1-44e9-83de-8a63d032cefd	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 08:57:37.694962
32ceb6db-00a6-4852-8dab-f2371371d934	f4dfa2bb-18e1-44e9-83de-8a63d032cefd	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-11 08:59:16.458377
916a9240-1ad2-4d7b-9dc8-e21b4a66c46d	ac69ae8a-c771-4b8f-9fc0-be49daaee356	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 10:36:51.486575
7db6d610-4149-4867-b247-00f6674af200	ac69ae8a-c771-4b8f-9fc0-be49daaee356	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-11 10:41:07.273726
69de13f8-f90a-4979-b633-c73e3b842bfb	ac69ae8a-c771-4b8f-9fc0-be49daaee356	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-11 10:43:43.88604
ef362ce2-e499-4083-8678-d4646d66b69a	ac69ae8a-c771-4b8f-9fc0-be49daaee356	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-11 10:44:14.751533
dc1d578b-48cf-40cb-804f-ddd440de0782	0c1864a3-851b-4a76-8f19-b9c82c199264	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-11 12:40:16.222965
4d9d2732-dbe7-46c7-9b56-e6b8689fb76d	0c1864a3-851b-4a76-8f19-b9c82c199264	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 12:41:09.51635
e2eb08e7-a1c2-4ab7-915e-7c0a2f42b4b5	5f0ee127-4706-417c-9964-22914aeabe78	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 13:23:14.343318
10ce384d-6651-4ac3-bf12-0725685eba3d	bb2afb85-7da3-4f37-9b08-5eac24a49ef2	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 14:03:52.219206
bf37526d-0b7b-4ab2-8dbd-c5c8ad429cee	bb2afb85-7da3-4f37-9b08-5eac24a49ef2	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-11 14:23:21.954102
9f1242a7-8277-4532-bea8-04885dceacf6	39b52168-3277-404c-89e6-caa673db7451	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 14:23:26.336292
2b601295-7252-4608-8e82-5ba82060137f	ffc5360c-79e7-469f-89e7-239ccfa49048	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 14:34:09.567344
52b46855-78c1-4313-8dc5-850a02afc12d	16d215c2-e2f4-4131-83f0-b16cf3a34571	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-11 17:24:33.315101
d379f459-82d8-4aa6-8b8b-01b49a4718a5	b7b35fab-737a-48fa-9df4-6395bf6307c1	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-11 18:11:51.422119
48712498-dfba-4fd0-9116-66a610caed8a	b7b35fab-737a-48fa-9df4-6395bf6307c1	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 18:12:25.434015
568eefac-d55f-4dc4-a227-0343aa104352	02972dc7-ce1d-4a02-951e-f6b618f8352d	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 18:48:09.240184
e403f09a-e508-4188-9091-9be6c465fa1c	72ffba8b-091e-4ebb-bfce-a965ab928b85	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 19:42:37.650044
2d72f457-e7a4-4955-ba04-2d690b2e6256	acf4dd3b-fe86-400a-9525-e3b77e89b808	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-11 22:11:56.179587
3b572515-5afb-47ae-91ff-4b39fdf2dab4	acf4dd3b-fe86-400a-9525-e3b77e89b808	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 22:12:35.582665
a926f1c2-6063-4464-b566-b23d209deb84	79a8efb7-e8ea-4eb9-99b1-0b2cd288df04	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-11 22:21:39.084478
bcedefde-8d49-4cb5-9f89-a1dbeae0f2eb	79a8efb7-e8ea-4eb9-99b1-0b2cd288df04	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-11 22:23:18.58326
bf15b5ff-8b08-4982-be84-24212491e9c9	79a8efb7-e8ea-4eb9-99b1-0b2cd288df04	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-11 22:25:29.303201
69471678-88ba-43f2-bdea-30737449d6ce	79a8efb7-e8ea-4eb9-99b1-0b2cd288df04	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-11 22:26:14.976339
acae36ba-9521-4ba1-8ab2-3adb985b0885	dd4c9ad9-7c1d-4aa8-8849-6db6026ee2f7	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-12 05:50:12.327358
dd82253b-839f-45b6-8817-f66761d2bff3	e4b02423-5164-471c-b102-faf493f5a041	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-12 12:51:10.033319
f172215d-f680-4e54-b2a0-44cb2e24a49b	e4b02423-5164-471c-b102-faf493f5a041	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-12 12:59:13.144214
90e824b3-0d43-45e9-994b-24c16ac0552c	e4b02423-5164-471c-b102-faf493f5a041	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-12 17:57:38.361884
a740d1d1-18cc-4e6d-ba25-54b84316f161	24d3d5a4-1969-4120-9d2a-07884d5ab82c	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-13 09:43:51.010616
1f1c3ce6-38ee-4a3e-8126-ee94973e70a5	f9768ec1-279c-4038-a426-f3f960099759	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-16 07:26:13.873741
0272b9d8-4f13-4f45-b9a5-decc63a28650	40a65594-469a-41e5-a35c-0a554fd41020	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-16 18:20:12.31922
df8a66d6-56f3-4ac3-a6dd-95cf79b216a1	9a33247d-66f8-4ebe-ae59-04f8cc5dfef3	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-18 07:50:03.281855
3e82639c-89b5-40af-b7ec-667da9d9f23b	9a33247d-66f8-4ebe-ae59-04f8cc5dfef3	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-18 07:51:00.945671
b9614aa7-ccdd-4bbd-81c0-384d34ee994a	9a33247d-66f8-4ebe-ae59-04f8cc5dfef3	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-18 07:51:24.136227
0d931de6-f923-4e9b-92b4-8f8e0fdb2154	9a33247d-66f8-4ebe-ae59-04f8cc5dfef3	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-18 07:51:43.568526
92c76c26-e3dd-4d28-9feb-5c07e75f2de9	33ab7934-418f-4c54-b61c-c0c9a2c868ac	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-18 08:10:47.995733
3e2ade3b-9b67-41bf-af06-814d41861e9c	33ab7934-418f-4c54-b61c-c0c9a2c868ac	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-18 08:12:47.232208
f1932ed7-fdfe-4c2e-838e-8c2c73667e48	33ab7934-418f-4c54-b61c-c0c9a2c868ac	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-18 08:14:21.019308
8c85b48c-0ed2-4888-b62c-7c280379a450	33ab7934-418f-4c54-b61c-c0c9a2c868ac	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-18 08:14:56.531713
8a062d4e-07be-4997-a881-69386c320ee3	3cbad6c2-2c3f-4786-ab99-26752e680a07	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-18 08:28:26.797399
10a39100-6f06-4f80-9983-0d7b0c74a8d6	3cbad6c2-2c3f-4786-ab99-26752e680a07	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-18 08:29:51.504471
2f83e2f7-8a2c-4987-a022-519096695d36	3cbad6c2-2c3f-4786-ab99-26752e680a07	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-18 08:30:19.091405
c5982222-11a7-41ff-b554-7bb4d04e1fe0	939f8ddc-5345-4982-bc8e-06a581342b9b	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-18 09:07:27.233584
49238281-88ab-4b63-9bc7-07a431aa5ad6	939f8ddc-5345-4982-bc8e-06a581342b9b	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-18 09:07:51.915083
2b4cb710-5704-4b16-9bec-fe29ef1b677b	60eb8321-f8e2-4cad-bf43-ccd4c65440cb	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-18 10:11:56.951212
dae111da-fcf8-4889-865c-f3e50b25084f	60eb8321-f8e2-4cad-bf43-ccd4c65440cb	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-18 10:13:18.832958
56a1d8e6-1361-41f8-a2ac-5bb13f36821e	60eb8321-f8e2-4cad-bf43-ccd4c65440cb	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-18 10:13:54.525767
fce9d06d-dca6-4630-98d9-2b37f9abe124	939f8ddc-5345-4982-bc8e-06a581342b9b	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-18 14:01:51.994761
222b0574-9e17-4887-aa7c-4b40b539d87c	0cf85ad6-6978-4114-a586-fb8f201d1d88	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-18 15:22:53.756855
443be590-510e-4262-8787-bf3fa300a5c8	0cf85ad6-6978-4114-a586-fb8f201d1d88	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-18 15:24:24.397544
7c4b79a3-10d1-486a-a85a-4396fc3e9181	887e566e-b448-4538-bf89-d8d1e0a7128d	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-18 15:51:46.187062
012ad4a4-dba6-423f-a3a6-2f5f2a7a6a43	887e566e-b448-4538-bf89-d8d1e0a7128d	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-18 15:53:12.496936
795ecdb0-7738-4369-84f1-3d86db103588	d6d96f1d-f8df-49cf-a85b-257211c80786	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-20 22:51:09.963692
5cd39a5d-db27-4daf-8f97-24551141bfdb	d6d96f1d-f8df-49cf-a85b-257211c80786	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-20 23:42:39.397465
62f78bba-0b6d-4383-bf2b-0582598da40a	79a8efb7-e8ea-4eb9-99b1-0b2cd288df04	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2025-10-22 14:03:00.612156
11162155-3fd0-41b1-a6f3-224890943854	e082aabd-ba0e-40b8-be29-80e0ad14cde9	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-23 13:14:50.714499
c597e781-0cff-4e3c-854b-c7f44b55fd76	4d38918b-97e2-488e-8abe-ee73d53b692a	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2025-10-23 16:03:21.648727
fc6fc16f-b671-4861-bbab-c81d130520a5	4d38918b-97e2-488e-8abe-ee73d53b692a	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-23 16:03:52.482018
101c85ab-f957-416a-aec7-52086f507f70	8e1e6a77-810c-418d-8a33-70ec0e3ad803	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2025-10-23 20:39:45.449841
4a892ced-0b04-47bb-9763-f9c9650e566c	8e1e6a77-810c-418d-8a33-70ec0e3ad803	2438277c-ff34-4ca4-b25f-a958429e657b	2025-10-23 20:41:31.736256
8b9121dc-ffb5-404c-984c-c9662c19e3b5	7d22c452-8903-4b70-8a81-6efc5fdcc386	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-25 12:14:38.206838
a7f1db30-e94a-49f4-b7af-585d6b492c52	7d22c452-8903-4b70-8a81-6efc5fdcc386	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-25 12:23:15.483287
28af111d-1a2f-4a5f-bada-5a56c52f3648	23e2f814-4bf0-4d48-84db-2fe69f5a269c	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-10-25 12:33:58.727691
6dc7337e-10d5-46c0-8c79-d7513975a877	e7defdd2-f406-47ef-92df-15688257cbcc	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-10-25 19:44:49.78839
f8cf9aed-297b-49ca-b473-570eee3d7a5c	380fc7c5-e993-4265-a7c8-1e6d83bdb536	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-10-30 21:39:25.102103
1dc299ec-451c-4bdb-bd82-2b4ddba74e2b	b13e0d32-3ca7-4922-8f38-29a8325b7f0b	2438277c-ff34-4ca4-b25f-a958429e657b	2025-11-02 08:57:42.411466
da4e58b1-bb47-409b-b23d-da93672f60a7	16baa92c-5f91-4b82-a796-1f619ea07141	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-03 10:02:14.42945
603de03b-6e2d-4b8a-aadd-d7f3d39fa787	7d22c452-8903-4b70-8a81-6efc5fdcc386	2438277c-ff34-4ca4-b25f-a958429e657b	2025-11-03 16:10:08.788946
bf4b4e8a-f0af-4fd2-9986-c2d99d0f3740	7d22c452-8903-4b70-8a81-6efc5fdcc386	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2025-11-03 16:10:50.875228
e18522ee-9b39-4d0b-85cf-a67e69c66249	ac69ae8a-c771-4b8f-9fc0-be49daaee356	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2025-11-03 20:01:40.781089
42fecc05-448b-42d5-ad50-662bd2a9a04a	887e566e-b448-4538-bf89-d8d1e0a7128d	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2025-11-03 20:52:26.492894
90da5dcb-bd0f-4991-a1fd-03fd6cdd3ae3	0e6a85bc-5b89-4874-98b1-515ef8dacbb3	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-11-03 21:58:29.856309
082c9cf0-e2ac-4cf1-8bf2-2c3816ccda7d	b13e0d32-3ca7-4922-8f38-29a8325b7f0b	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-03 23:08:17.212762
83fac84e-f36a-4234-8501-4823417c67dd	b13e0d32-3ca7-4922-8f38-29a8325b7f0b	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-11-03 23:09:45.261781
1ea8aa64-4b5b-4fd7-b3df-b518e27c7817	22816500-cc63-4135-8d48-c769166cdda5	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-04 06:29:15.253023
fdc3231f-e572-4efe-881e-05ad3f90e973	22816500-cc63-4135-8d48-c769166cdda5	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2025-11-04 06:30:56.216653
fa8c7ec6-b581-48f9-b533-650fcf01dabb	22816500-cc63-4135-8d48-c769166cdda5	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-11-04 06:31:43.228551
732d0bd7-e65e-4026-9fee-bf415403e77c	22816500-cc63-4135-8d48-c769166cdda5	2438277c-ff34-4ca4-b25f-a958429e657b	2025-11-04 06:33:17.259766
d348c475-6e5b-453b-b28d-5d438a3a0dc7	7eb822b8-b951-4f68-928a-c607c7f2ffb5	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-04 10:02:23.270917
89f007cb-1256-4a04-9da0-658475a7c36b	36847d5a-dd9b-4463-ac3e-4a34c0269623	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-11-04 13:48:28.185748
e62ca9f0-0313-4ad7-964c-9a72976815de	36847d5a-dd9b-4463-ac3e-4a34c0269623	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-04 13:59:25.163772
a2ac789e-6d88-47db-b19b-6533f90688de	c5cbd63c-f53d-43fc-878c-05f54e26aeb0	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-08 09:35:40.348452
564c4d69-3dd5-40e8-bab3-84ae6f11a93e	4b338dcc-6ab6-4e44-96a2-b2b1475c6b3b	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2025-11-10 10:49:25.189244
cd87f314-9123-4129-a0d6-4d9075707555	4b338dcc-6ab6-4e44-96a2-b2b1475c6b3b	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-11-10 10:52:21.518589
a55c7370-c8c9-4a78-b132-8a2a6364d2f2	4b338dcc-6ab6-4e44-96a2-b2b1475c6b3b	2438277c-ff34-4ca4-b25f-a958429e657b	2025-11-10 10:55:39.688325
7316c423-278a-44dc-ba33-762db2f66495	4b338dcc-6ab6-4e44-96a2-b2b1475c6b3b	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-10 10:56:34.232314
db5f26f5-e0a4-4022-8192-429905720135	43db3c9f-ba32-4de7-9b63-93e5006463fb	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-10 12:26:23.661375
1c4876a7-ccb7-40bf-8c4d-310f8899b3fc	43db3c9f-ba32-4de7-9b63-93e5006463fb	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-11-12 21:38:59.730765
d3344a11-5077-4016-95ea-075327a95527	f9768ec1-279c-4038-a426-f3f960099759	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2025-11-13 08:24:23.128196
1ebc882d-c526-4690-9fef-9dee8780c86d	7541c1d4-d31b-4e58-a664-cb5d38e4e6b6	1502e68c-4834-4c69-ac99-5eccd058707f	2025-11-16 09:36:39.656057
57bf2ff3-78b1-44d4-bd0f-5c35fb924611	ac69ae8a-c771-4b8f-9fc0-be49daaee356	1502e68c-4834-4c69-ac99-5eccd058707f	2025-11-16 09:38:15.44991
0b1fde98-072b-4f45-9a83-73a643a5a2e5	887e566e-b448-4538-bf89-d8d1e0a7128d	1502e68c-4834-4c69-ac99-5eccd058707f	2025-11-18 12:35:00.579809
983a634a-2a59-4034-964e-c60499404dcc	c0eab1f0-1fd1-4152-a263-1933a0a35c13	1502e68c-4834-4c69-ac99-5eccd058707f	2025-11-22 12:33:46.649342
d7b1faae-5ba4-454b-930a-384b6885025d	483950e8-c175-4b1e-8d51-0414dbf82532	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2025-11-22 12:36:53.424638
d021df7d-ae70-4898-9d99-98eb7bc3dc92	483950e8-c175-4b1e-8d51-0414dbf82532	4b66ee57-a8f6-40e4-9880-501efb9526e7	2025-11-22 12:37:36.172497
c27c99b4-97fd-4538-883d-bf459e2a68d1	483950e8-c175-4b1e-8d51-0414dbf82532	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-11-22 12:39:26.381406
145e139f-9c39-4604-9076-51e6a58a3b3a	c0eab1f0-1fd1-4152-a263-1933a0a35c13	2d7897f0-df02-4369-b6f3-04de75a319a1	2025-11-22 12:40:56.383212
02c9e5c7-f828-44e8-a727-3548fdf162ba	483950e8-c175-4b1e-8d51-0414dbf82532	1502e68c-4834-4c69-ac99-5eccd058707f	2025-11-22 12:41:03.974845
e9a08d74-f463-4a2f-bfa1-7ca1e2968376	0173ff91-af2c-4359-9318-56411d551cd3	78a9c71c-06a3-4035-b00c-3bea819c2a7d	2025-11-22 20:53:38.736936
7b78d3d3-8a88-44be-9054-b652224f381b	d72bb5b0-e689-4084-96ce-4d3535e3ec42	c3b9aca3-2275-41a8-91ff-a10e8417ff10	2026-01-10 05:46:05.593379
bbc35177-a23d-48a0-921e-35fdc034ccbd	dfdb8345-fa66-4745-ae3c-6f0e60bdfad4	4b66ee57-a8f6-40e4-9880-501efb9526e7	2026-01-28 19:37:11.73248
\.


--
-- Data for Name: chapters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chapters (id, title, chapter_type, price, summary, serial_no, pages, chapter_status, comic_id, unique_code, created_at, updated_at) FROM stdin;
4b66ee57-a8f6-40e4-9880-501efb9526e7	Totem one shot 	free	0		1	{creators/Sol/1759436587566-ynxqle.png,creators/Sol/1759436589074-4xl88.png,creators/Sol/1759436590412-07mxk.png,creators/Sol/1759436591591-g65rt.png,creators/Sol/1759436593387-2vemwb.png,creators/Sol/1759436595164-1isgmr.png,creators/Sol/1759436596506-z7g8br.png,creators/Sol/1759436597520-9sxhv.png,creators/Sol/1759436599122-2z8lv79.png,creators/Sol/1759436602686-ceijd.png,creators/Sol/1759436605434-t75k2l.png,creators/Sol/1759436607108-4rx9pb.png,creators/Sol/1759436608564-g54vct.png,creators/Sol/1759436610518-6czt2.png,creators/Sol/1759436612098-gwt1xxo.png,creators/Sol/1759436613777-dkglio.png,creators/Sol/1759436615273-g13oyw.png,creators/Sol/1759436616939-mykcj9.png,creators/Sol/1759436618479-a7qexg.png}	published	1f6b92ab-205c-48dc-89c5-c473f033e08d	2361	2025-10-02 20:23:48.027118	2025-10-02 20:23:48.027118
2438277c-ff34-4ca4-b25f-a958429e657b	Exorcism	free	0	A fight has begun	1	{creators/CluelessPen/1759849664363-oizjq.jpg,creators/CluelessPen/1759849674880-5idxf6.jpg,creators/CluelessPen/1759849689426-etxfah.jpg,creators/CluelessPen/1759849707459-9z3vtb.jpg,creators/CluelessPen/1759849723767-i1o1s9.jpg,creators/CluelessPen/1759849732553-gprcf.jpg,creators/CluelessPen/1759849746431-1mkxtq.jpg,creators/CluelessPen/1759849755942-lje3s7.jpg,creators/CluelessPen/1759849768018-kd50k.jpg,creators/CluelessPen/1759849777278-y4xqc.jpg,creators/CluelessPen/1759849784203-f06jz5.jpg}	published	abacb4fa-7ae4-45c3-b6ef-447d0c84d3a8	1346	2025-10-07 15:12:05.197368	2025-10-07 15:12:05.197368
5133067f-e471-4b3b-af25-4cc589e9ff77	Introduction	free	0	The beginning	0	{creators/JonnyBravo/1759908783635-y08wy.png,creators/JonnyBravo/1759908786166-bn5n703.png,creators/JonnyBravo/1759908785167-ltq7bn.png,creators/JonnyBravo/1759908787696-bn2pqp9.png}	draft	d09c119b-4639-434f-9dcf-3ecf7f0ae1eb	9872	2025-10-08 07:33:45.116967	2025-10-08 07:33:45.116967
2d7897f0-df02-4369-b6f3-04de75a319a1	Prologue	free	0		1	{creators/Dosdee/1760128584472-xkh19q.png,creators/Dosdee/1760128586821-dvmzw9.png,creators/Dosdee/1760128588914-wqzkod.png,creators/Dosdee/1760128591177-dmftr.png,creators/Dosdee/1760128593517-d0wk8q.png,creators/Dosdee/1760128595827-48pv7a.png,creators/Dosdee/1760128598520-lleyjd.png,creators/Dosdee/1760128600312-10ekm.png,creators/Dosdee/1760128601871-34mgnr.png,creators/Dosdee/1760128604177-k41u9.png,creators/Dosdee/1760128606424-0dex4.png,creators/Dosdee/1760128608707-u9kig.png,creators/Dosdee/1760128610333-dknyjk.png,creators/Dosdee/1760128612653-ycy0bq.png,creators/Dosdee/1760128615030-qqbt7x.png,creators/Dosdee/1760128617159-4byvv.png,creators/Dosdee/1760128618940-b5jqqe.png,creators/Dosdee/1760128621679-e9bmce.png,creators/Dosdee/1760128623724-7dujjl.png,creators/Dosdee/1760128624561-8kelmn.png,creators/Dosdee/1760128628549-z8zji.png,creators/Dosdee/1760128631108-fllp1h.png,creators/Dosdee/1760128633488-efp6ph.png,creators/Dosdee/1760128635672-8wv1t.png,creators/Dosdee/1760128637711-nuqaym.png,creators/Dosdee/1760128640037-xxq4fh.png,creators/Dosdee/1760128643065-e2grzj.png,creators/Dosdee/1760128645612-g9ozz5.png,creators/Dosdee/1760128648435-g5aqkl.png,creators/Dosdee/1760128650789-xnz18i.png,creators/Dosdee/1760128653233-nzkpmj.png,creators/Dosdee/1760128655546-7ypnk8.png,creators/Dosdee/1760128657864-a8q49b.png,creators/Dosdee/1760128659410-3lhhu.png,creators/Dosdee/1760128662347-gcvewk.png,creators/Dosdee/1760128665151-p802v.png,creators/Dosdee/1760128667287-zeybjz.png,creators/Dosdee/1760128669398-3rp5jq.png,creators/Dosdee/1760128671804-w5payt.png,creators/Dosdee/1760128672610-d1rdbc.png}	published	c63fed22-6ab5-4e86-93e8-97a908cbd533	5938	2025-10-10 20:38:33.702255	2025-10-10 20:38:33.702255
78a9c71c-06a3-4035-b00c-3bea819c2a7d	Curse X	free	0		1	{creators/JDComics/1761072310043-f6xzcv.jpg,creators/JDComics/1761072313809-eggxcd.jpg,creators/JDComics/1761072322601-kcf6w.jpg}	published	2d15f682-3892-4e19-9c69-0c7819bf5f7a	5266	2025-10-21 18:45:31.107634	2025-10-21 18:45:31.107634
c3b9aca3-2275-41a8-91ff-a10e8417ff10	ONE SHOT	free	0		1	{creators/Timi%20arts/1759833077285-1zcts.jpg,creators/Timi%20arts/1759833080407-hoybei.jpg,creators/Timi%20arts/1759833083484-k05h44.jpg,creators/Timi%20arts/1759833086235-6oqs6k.jpg,creators/Timi%20arts/1759833089066-a7lvp8.jpg,creators/Timi%20arts/1759833091758-lydf7r.jpg,creators/Timi%20arts/1759833094709-6zhvj5.jpg,creators/Timi%20arts/1759833097900-wvcwx.jpg,creators/Timi%20arts/1759833100843-ckvyil.jpg,creators/Timi%20arts/1759833103765-l952xid.jpg,creators/Timi%20arts/1759833106748-og1dx5.jpg,creators/Timi%20arts/1759833109604-w0asgr.jpg,creators/Timi%20arts/1759833112336-xk7up.jpg,creators/Timi%20arts/1759833115150-vvbxl.jpg,creators/Timi%20arts/1759833118106-7uda6m.jpg,creators/Timi%20arts/1759833120640-fgzm2h.jpg,creators/Timi%20arts/1759833123569-o72xfl.jpg,creators/Timi%20arts/1759833126489-nsktdm.jpg}	published	dd26b871-1e92-4312-9fdb-3696acab151f	8490	2025-10-07 10:34:17.531078	2025-10-07 10:34:17.531078
1502e68c-4834-4c69-ac99-5eccd058707f	Beginning of the End	free	0		1	{creators/Danbrown%20the%20Artist/1763283240360-6sxgaj.jpg,creators/Danbrown%20the%20Artist/1763283249613-zn0w99.jpg,creators/Danbrown%20the%20Artist/1763283261827-hk9otr.jpg,creators/Danbrown%20the%20Artist/1763283274853-duh5b.jpg,creators/Danbrown%20the%20Artist/1763283287298-d4k5k.jpg,creators/Danbrown%20the%20Artist/1763283299628-20pa8.jpg,creators/Danbrown%20the%20Artist/1763283313205-4f1mj6.jpg,creators/Danbrown%20the%20Artist/1763283325210-jirdj.jpg,creators/Danbrown%20the%20Artist/1763283335350-i96uj.jpg,creators/Danbrown%20the%20Artist/1763283347505-l85vju.jpg,creators/Danbrown%20the%20Artist/1763283359778-y7hgmh.jpg,creators/Danbrown%20the%20Artist/1763283372103-j0zzmr.jpg,creators/Danbrown%20the%20Artist/1763283382307-anhlcs.jpg,creators/Danbrown%20the%20Artist/1763283396469-xvemhl.jpg,creators/Danbrown%20the%20Artist/1763283408789-nxxjil.jpg,creators/Danbrown%20the%20Artist/1763283418922-uafnh.jpg,creators/Danbrown%20the%20Artist/1763283428167-9bvxr.jpg,creators/Danbrown%20the%20Artist/1763283437115-klap9d.jpg,creators/Danbrown%20the%20Artist/1763283446207-j7ht5f.jpg}	published	1f9aa3e1-b8a4-41bf-bf48-b8e1eb9efd77	7440	2025-11-16 09:08:18.501684	2025-11-16 09:08:18.501684
\.


--
-- Data for Name: comic_subscribers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comic_subscribers (id, reader_id, comic_id, subscribed_at) FROM stdin;
500d2851-251d-421f-8011-de1faa27ef4f	887e566e-b448-4538-bf89-d8d1e0a7128d	1f6b92ab-205c-48dc-89c5-c473f033e08d	2025-10-02 20:32:05.06814
c1771aac-b738-4ef5-9679-d48cedb66b57	0c1864a3-851b-4a76-8f19-b9c82c199264	1f6b92ab-205c-48dc-89c5-c473f033e08d	2025-10-11 12:42:16.927025
06948a0b-711c-4b6a-93eb-fb48c27f6112	79a8efb7-e8ea-4eb9-99b1-0b2cd288df04	c63fed22-6ab5-4e86-93e8-97a908cbd533	2025-10-11 22:32:47.794756
4832cf8a-acbb-4d80-933d-bd38eebdfc49	939f8ddc-5345-4982-bc8e-06a581342b9b	1f6b92ab-205c-48dc-89c5-c473f033e08d	2025-10-21 17:04:47.917175
d6c144a5-c9df-4ff3-997e-234d9b6d4f79	f9768ec1-279c-4038-a426-f3f960099759	1f6b92ab-205c-48dc-89c5-c473f033e08d	2026-01-24 15:56:22.879756
b3f31d1a-a93c-4413-912b-3f30a8e94bb1	d72bb5b0-e689-4084-96ce-4d3535e3ec42	2d15f682-3892-4e19-9c69-0c7819bf5f7a	2026-01-25 16:43:35.668553
\.


--
-- Data for Name: comics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.comics (id, title, language, age_rating, no_of_chapters, no_of_drafts, description, image_url, comic_status, genre, tags, slug, creator_id, created_at, updated_at) FROM stdin;
1f6b92ab-205c-48dc-89c5-c473f033e08d	Totem one shot 	en	teens-13+	1	0	An excerpt from the upcoming series Totem	creators/Sol/1759398199294-1ihpwf.png	published	{Fantasy}	{}	totem-one-shot--Sol	8bbd5274-33d8-4608-a157-3f1216cbbe9f	2025-10-02 09:43:51.53802	2025-10-02 09:43:51.53802
abacb4fa-7ae4-45c3-b6ef-447d0c84d3a8	Quick Blade	en	all-ages	1	0	A quck blade fighting series.	creators/CluelessPen/1759849552619-g0g3bl.jpg	published	{Fantasy,Adventure}	{Action,Shounen}	quick-blade-CluelessPen	adf3e351-a898-4ec7-8c74-aea109d558a7	2025-10-07 15:06:02.608013	2025-10-07 15:06:02.608013
d09c119b-4639-434f-9dcf-3ecf7f0ae1eb	The Epistle	en	all-ages	0	1	The Epistle	creators/JonnyBravo/1759871298966-81uq8.jpg	draft	{Fantasy,"Historical Fiction"}	{epistle}	the-epistle-JonnyBravo	d7069790-214a-490b-a267-3b658ae2c1d2	2025-10-07 21:08:26.607091	2025-10-07 21:08:26.607091
c63fed22-6ab5-4e86-93e8-97a908cbd533	In My Head	en	mature-17+	1	0	Dyre is a 17 year old high school student. He wakes up to a world changing around him as he can now see imaginations. With the help of his new best friend, Utheury and others he meets along the way, he's set on an unforgettable adventure to overcome an overwhelming emotion.	creators/Dosdee/1760128113673-6b41at.png	published	{Mystery,Comedy,Adventure}	{head,"in my head",utheury,dosdee}	in-my-head-Dosdee	fd94319d-7af1-4449-8891-b811e38881a9	2025-10-10 20:28:45.338229	2025-10-10 20:28:45.338229
9d9e5f60-6347-44f1-8499-e937b3867794	Observation: TOTSK	en	all-ages	0	0	It's just a story I'm making up along the line	creators/Cmdliner/1760211929199-2kt7to.jpg	draft	{Fantasy}	{}	observation-totsk-Cmdliner	4cf620a0-8bb8-42ba-9c94-c362e177766f	2025-10-11 19:45:42.619365	2025-10-11 19:45:42.619365
edec85bf-6a25-4364-8a93-6feef323cda7	Tales 'n' Tells	en	teens-13+	0	0	TALES 'N' TELLS IS A COMIC BOOK ANTHOLOGY THAT DARES TO EXPLORE THE UNCONVENTIONAL THROUGH FLASH-FICTIONAL STORIES, PRESENTING IDEAS THAT CHALLENGE MAINSTREAM NARRATIVES THROUGH RAW, EVOCATIVE AND QUIRKY THEMES. THE ANTHOLOGY BRINGS TOGETHER A DIVERSE COLLECTION OF COMIC STORIES THAT, WHILE VARIED IN STYLE AND TONE, SHARE A COMMON THREAD OF EXAMINING THE HUMAN CONDITION.	creators/Tales%20'n'%20Tells/1760790408673-zt8ez.png	draft	{"Science Fiction",Mystery,Fantasy}	{Fiction,"Flash Fiction","Science fiction",Sci-fi,Art,African,Mythology}	tales-n-tells-Tales 'n' Tells	7af0cca4-2a21-44c3-a01f-9333da219a83	2025-10-18 12:28:08.586058	2025-10-18 12:28:08.586058
dd26b871-1e92-4312-9fdb-3696acab151f	Little Soldier 	en	teens-13+	1	0	Young boy surviving the rages of war 	creators/Timi%20arts/1759832807603-4jsxwd.jpg	published	{"Historical Fiction"}	{}	little-soldier--Timi arts	8a536934-286c-4a6a-ac06-ca385ef6bf14	2025-10-07 10:27:08.948136	2025-10-07 10:27:08.948136
2d15f682-3892-4e19-9c69-0c7819bf5f7a	Curse X	en	teens-13+	1	0	Just a brief bio for testing	creators/JDComics/1761072227673-piuu74.jpg	published	{Fantasy,Mystery,Thriller,"Historical Fiction"}	{}	curse-x-JDComics	af7f1ce4-7c66-4dcd-b4be-2744bc686deb	2025-10-21 18:44:13.289121	2025-10-21 18:44:13.289121
2c63c7ee-ed36-4f0b-bded-8f6e447c1a75	Nigerion	en	teens-13+	0	0	On the distant planet Kepler-22B, a cosmic war sets the stage for a legend unlike any other. When Lucas Femi crash-lands in the heart of Abuja, Earth gains an unearthly protector—Nigerion. Gifted with powers beyond human understanding—green laser vision, super speed, flight, and unstoppable strength—he must navigate a world that fears what it does not understand. As secrets from his origin begin to surface, so does a threat that could shake both worlds to their core.\n\nExperience the explosive beginning of Africa’s newest superhero legacy—crafted with depth, power, and purpose.	creators/Epicrand%20/1762775552781-ai39d.jpeg	draft	{Superhero,Adventure,Cyberpunk,"Science Fiction"}	{}	nigerion-Epicrand 	1885c82c-a4d1-41e3-b77f-5a7530663424	2025-11-10 11:56:47.734755	2025-11-10 11:56:47.734755
1f9aa3e1-b8a4-41bf-bf48-b8e1eb9efd77	Deity	en	teens-13+	1	0	After the murder of his Family Isaac and Mavis are\nthrust into a world of demons and gods as they\ndiscover their connections to an ancient Deity that is\ndetermined to have them dead. Can they with the help\nof a mysterious Northern warrior, collect all pieces of\nthe god-killer blade in other to change their destiny	creators/Danbrown%20the%20Artist/1762801455753-rbwlby.jpg	published	{Fantasy,"Historical Fiction",Adventure}	{deity,mavis,isaac,shambala,ola,ogun}	deity-Danbrown the Artist	a791b6ff-18d4-421c-9b77-73afa6877465	2025-11-10 19:05:08.375655	2025-11-10 19:05:08.375655
\.


--
-- Data for Name: creator_bank_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.creator_bank_details (id, creator_id, bank_name, account_number, account_name, created_at, updated_at) FROM stdin;
0baaee77-ff92-4aed-8729-f774124a024a	6602adb4-8b87-4e3d-9232-0999dc418900	Sterling	3038283989	John	2026-01-20 03:48:22.445873	2026-01-20 03:48:22.445873
\.


--
-- Data for Name: creator_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.creator_profile (id, user_id, full_name, creator_name, phone_number, bio, genres, wallet_type, wallet_address, wallet_balance, pin_hash, created_at, updated_at) FROM stdin;
af7f1ce4-7c66-4dcd-b4be-2744bc686deb	533286d4-a228-4f62-9bf6-53006062507f	John Doe	JDComics	+2348012345678	Comic creator focusing on sci-fi and fantasy	{fantasy,sci-fi}	\N	\N	0	\N	2025-09-29 10:26:33.634325	2025-09-29 10:26:33.634325
80c79450-1d6e-4ced-b125-e3f7bcb692c8	9df9adf7-7eea-4877-920e-2faa8f4a63cf	Priase	praise5	07042007069	chiiiii ayooooooooo	{}	solflare	9GGoMZM96oHr85fcSovzr2SpZyDtH89ckaJ3tbigoKxe	0	\N	2025-09-29 13:51:08.013104	2025-09-29 13:51:08.013104
7c3453fb-416e-43f5-8a26-ef2405377a2b	ad82da70-db6a-402c-9830-1af81790b0e6	philip khristos	lord khristos	08101525041	I make stuff	{}	\N	\N	0	\N	2025-09-29 14:44:34.179731	2025-09-29 14:44:34.179731
e7d287de-418c-4314-9020-95ba60e25606	f002b0a8-2b15-4bfe-81d9-42d4ffe43846	Baridilo Kpalap	Mugensbride 	07038123852	I love bread 	{}	\N	\N	0	\N	2025-09-29 20:01:20.735019	2025-09-29 20:01:20.735019
8a536934-286c-4a6a-ac06-ca385ef6bf14	73bacc60-7543-4811-9244-831aad007445	Timi	Timi arts	07012416640	Art god in this world	{}	\N	\N	0	\N	2025-09-29 20:17:14.976397	2025-09-29 20:17:14.976397
a4b2b976-15b2-4614-8bd2-d2727a835bd6	e116ed48-5fb1-4ffe-9445-da666f244896	Benny Asitonka-Joe	AJ_Benny	+234 702 656 1609	African inspired creator	{}	\N	\N	0	\N	2025-10-01 10:37:47.439302	2025-10-01 10:37:47.439302
d7069790-214a-490b-a267-3b658ae2c1d2	b34c0cf0-f41b-4788-ad98-f4d2419559cf	John	JonnyBravo	1234567880	Just trying to make it in life	{}	\N	\N	0	\N	2025-10-01 12:30:53.644892	2025-10-01 12:30:53.644892
31f66740-f584-48bf-828a-b22291fb80b4	d905c6ee-b25e-4a7a-82ff-f277539f863a	Chibuogu 	Bugsy	08162600600	I create art fueled by the power of African beauty…	{}	\N	\N	0	\N	2025-10-02 09:12:50.084977	2025-10-02 09:12:50.084977
8bbd5274-33d8-4608-a157-3f1216cbbe9f	e7575adb-20d0-426d-9c68-b5337f34a1d6	Sol Invictus	Sol	+447404554251	It's one emotional rollercoaster 	{}	\N	\N	0	\N	2025-10-02 09:41:55.40843	2025-10-02 09:41:55.40843
0bb1434e-b821-433a-9f03-9dda3d9f586c	2c648bb3-5ddb-4342-96b1-6442501aa481	Divina O. 	Goddess	07044537454	It's about me and my love Benny	{}	\N	\N	0	\N	2025-10-02 16:35:34.53747	2025-10-02 16:35:34.53747
7af0cca4-2a21-44c3-a01f-9333da219a83	06000057-f0f9-46fc-94da-049fb30c921d	Ayegbusi Tobi	Tales 'n' Tells	09037065378	A flash fiction comic anthology series	{}	\N	\N	0	\N	2025-10-02 21:09:11.626867	2025-10-02 21:09:11.626867
ec6e3ad3-9aff-4d8a-bd05-ca5abf86f393	8397f236-2a25-4c83-b2b8-8ab3d503bac5	Cuisel Peach	Cuisel_creator	07081325831	Folktale inspired	{}	\N	\N	0	\N	2025-10-03 21:28:45.960199	2025-10-03 21:28:45.960199
f79999da-4f5b-4439-a543-d5759e29621e	8d1b9e63-b33c-4a18-b37e-cb29b8acd24b	Franklin Richard Onuemenachi 	Sandman47 	09165620196	A horror thriller and a girl who finds herself in the middle of everything	{}	\N	\N	0	\N	2025-10-05 08:31:39.587091	2025-10-05 08:31:39.587091
adf3e351-a898-4ec7-8c74-aea109d558a7	2a46b96d-03e2-46f6-ba99-be45cf370b20	Edidiong 	CluelessPen	08160738670	I want to make stories.	{}	\N	\N	0	\N	2025-10-07 11:03:01.179188	2025-10-07 11:03:01.179188
c2b37600-2a45-47ae-ac7f-d0a72940bf71	8e09069f-e168-4cec-b1e9-1714e99da95e	Victor Uzoma	Victor Uzoma 	08125559202	Hello there 	{}	\N	\N	0	\N	2025-10-07 19:45:31.05522	2025-10-07 19:45:31.05522
014af051-04ed-45d7-a737-88017ee50cf8	b73dc977-85a8-4141-8a2e-edb3b2465086	Ile Emmanuel	Emmyying 	0812 578 0175	A superhero in a Dystopian world 	{}	\N	\N	0	\N	2025-10-08 21:47:08.113189	2025-10-08 21:47:08.113189
118b972c-c305-43ac-8e24-8187733f1192	67ade92d-92ec-407c-8020-6a24e2fd4414	philip alare	Alaye	08101525041	Alaye man of the hour, publishings 	{}	\N	\N	0	\N	2025-10-09 14:23:58.176541	2025-10-09 14:23:58.176541
f14a134d-56d8-4b8a-af83-6cd19e0293f0	e199fa9f-308e-4004-9abc-92a3a1adaf01	Neo pryme entertainment 	Neo pryme comics	08101525041	Novelty and profundity instituted...making new stuff, with age old messages 	{}	\N	\N	0	\N	2025-10-09 14:36:45.030247	2025-10-09 14:36:45.030247
fd94319d-7af1-4449-8891-b811e38881a9	5de4c82e-a30b-46d6-99cc-6f9b13962b70	Dosdee	Dosdee	08163352228	Dyre is a 17 year old high school student. He wakes up to a world changing around him as he can now see  imaginary beings. With the help of his new best friend, Utheury and a couple other friends he makes along the way, he's set on an adventure to undo the mistakes of an overwhelming emotion. 	{}	\N	\N	0	\N	2025-10-10 19:48:14.729547	2025-10-10 19:48:14.729547
3e52927a-8b0f-49bd-b877-427e02d63b4c	2e927d9e-75d6-4119-8a08-3a144b726fed	Caleb Wodi	Calchiwo	09066451603	God Never Fails ✝️	{}	\N	\N	0	\N	2025-10-11 16:22:40.64303	2025-10-11 16:22:40.64303
5fcba659-9170-4727-a5c0-5d2ac2039e34	7d05d8e3-af7d-4c2f-8418-853fc1d854c0	Samuel Ifeoluwa 	Drew🪐	08167168904	Intellectual expression 	{}	\N	\N	0	\N	2025-10-11 17:32:42.401461	2025-10-11 17:32:42.401461
4cf620a0-8bb8-42ba-9c94-c362e177766f	e4b8ab68-6d78-437f-becc-eccf3cb1b853	Commandliner	Cmdliner	09011974957	The silent knight is a story	{}	\N	\N	0	\N	2025-10-11 19:44:01.980746	2025-10-11 19:44:01.980746
174e86f4-a934-4f1c-8ad7-534e21744a4f	3eb0a7c0-b23d-496f-83a4-436ba285b679	Elijah Agbolabori	AR	09161176714	Aurora is a goddess and also an Avatar of Ra	{}	\N	\N	0	\N	2025-10-18 07:58:39.746687	2025-10-18 07:58:39.746687
79fae666-820e-434d-8a9a-adbb41e0defa	a0ce8c26-5318-4c0b-8291-f83536100011	Raphael sie	InMaGinNationz 	+2349161364707	 Basic classic cartoons 	{}	\N	\N	0	\N	2025-10-18 08:24:17.881887	2025-10-18 08:24:17.881887
9c41c3de-8729-47e5-b1ad-f6814c1f6cef	c34b21d2-d9e0-4ef7-800f-2347eaec244b	Blossom Akpojisheri	Skaparinn 	+2348125279606	Coming soon...	{}	\N	\N	0	\N	2025-10-18 08:52:05.840281	2025-10-18 08:52:05.840281
bb98c899-de3b-450e-87c4-e93c25c5b2b8	f7f7930c-178c-4da8-b31b-9c6be4b53ca4	Mitchel onye	PurplePlutonian	09113151608	Thriller , superhero 	{}	\N	\N	0	\N	2025-10-18 08:59:55.540599	2025-10-18 08:59:55.540599
296d1d49-2e91-44b3-a924-332f5d082408	424cc417-d81b-4582-8616-b3cffd4e977a	Chinenye Ebubechi	Mr. Daddy	09061714289	Super hero genre	{}	\N	\N	0	\N	2025-10-18 09:49:35.782398	2025-10-18 09:49:35.782398
c1abf109-aba5-477d-9690-de511ba3fbe1	4d756bf6-e819-486b-ad9c-34af8af8aa2e	Favour Atukpa	Fayborah 	08139597193	A series of horror Faction inspired by Night Class adventures and misadventures...	{}	\N	\N	0	\N	2025-10-18 09:49:42.516347	2025-10-18 09:49:42.516347
8f1781b4-c40d-440a-8881-10c3531479f9	deddfdbe-22e9-48cf-b651-fdfeeb294624	Praise Amiso .T.	CLaM_Art	08140270238	My story is one about revenge and mystery, a story filled with cool character designs, a futuristic nation call Zadara( just Nigeria but more advanced) and of course crime families that run different sections of the nation\nMy main character Dumo is a boy with a messed up back story and it only got darker as his thirst for revenge grew bigger	{}	\N	\N	0	\N	2025-10-19 06:17:37.112369	2025-10-19 06:17:37.112369
d9aa2cbc-34ff-4aad-af15-1211dd3aee13	47d27230-b061-4dcf-bb47-9813d2a673f1	Jane	JACK	08117219009	Mindsets and mentality are subject to change. If any piece of my current mindset resonates with you, I am honoured it did.	{}	\N	\N	0	\N	2025-10-19 08:26:58.055369	2025-10-19 08:26:58.055369
0b45e948-ed3e-43f2-96b1-2651af329a56	a347c899-6600-4829-9844-66e13a29c291	Praise George	Praise the Great	07042007069	Epic and romantic comics 	{}	\N	\N	0	\N	2025-10-30 21:33:54.202656	2025-10-30 21:33:54.202656
a791b6ff-18d4-421c-9b77-73afa6877465	f972d792-5615-4f8f-9830-261749132640	Omiebam Brown	Danbrown the Artist	08179722015	\nAfter the murder of his Family Isaac and Mavis are\nthrust into a world of demons and gods as they\ndiscover their connections to an ancient Deity that is\ndetermined to have them dead. Can they collect all pieces of the god-killer blade in other to change their destiny.	{}	\N	\N	0	\N	2025-10-31 21:12:41.091255	2025-10-31 21:12:41.091255
78c4908b-43a6-44e8-bdc8-7277e69cb707	f28496c5-fb09-4103-8d72-ec520f8205dc	Chiagoziem Ofuani	TyrantSong	9064813424	In a world of might makes right, where children sacrifice parents and parents their children. A young man hardens his resolve to crush the society that allowed such to exist	{}	\N	\N	0	\N	2025-11-03 13:00:17.616299	2025-11-03 13:00:17.616299
b775db41-cff8-4f3b-8d6d-c9398df4a697	ed2c5df8-0fb9-4f02-a1e5-2f771681ee02	Tom	Titan	07377233254	I am a creator of worlds	{}	\N	\N	0	\N	2025-11-03 14:43:41.877085	2025-11-03 14:43:41.877085
9f846361-0f85-4d24-8f83-0e052564b893	a4d4baf7-5c03-4116-a0e5-cbfffbe6c071	Chimzi Chiorlu	Edwin Cheal	09092854082	Creator of worlds	{}	\N	\N	0	\N	2025-11-08 09:35:59.760848	2025-11-08 09:35:59.760848
1885c82c-a4d1-41e3-b77f-5a7530663424	3f91f97b-0177-4679-88c2-6c7277a037da	Michael Donald	Epicrand 	08109674870	A global creative powerhouse.\nDriven by innovation. Defined by excellence.	{}	\N	\N	0	\N	2025-11-10 11:40:53.461313	2025-11-10 11:40:53.461313
0d6f9e6f-433b-446a-9095-95faad6b1001	e2930a43-76aa-4b0c-b373-a6551e91e0e0	Iruoghene Atani	Iro_atani	8952457423	Ai creator	{}	\N	\N	0	\N	2025-11-14 18:37:01.846111	2025-11-14 18:37:01.846111
22b684df-2ef8-4fbe-8ae3-fdb9f193aca9	f266fd42-1603-4e44-b0d4-07870510fcd6	Donald Michael	Epicrand	07061496669	A dying alien world. A desperate escape. A child cast across the stars.\nWhen the last survivor of a galactic war crashes in the forests of Nigeria, a new destiny is born. Raised as Lucas, he grows into an ordinary young man—until a cosmic message exposes his true origin and threatens the planet he now calls home.\nSkyfall begins the legend of Nigerion, where the line between alien and human blurs, and one man must choose between his past and the world he loves.	{}	\N	\N	0	\N	2025-11-15 07:21:05.369172	2025-11-15 07:21:05.369172
f0c81360-b0cc-4d99-811a-48ae871a7f87	1874f1f6-fca3-4f41-bd86-30e6e3368a28	Uyiosa Osagie 	Osare	09061948797	These are a series of chaotic, exciting and entertaining one shots by yours truly 	{}	\N	\N	0	\N	2025-11-15 16:58:30.032752	2025-11-15 16:58:30.032752
6602adb4-8b87-4e3d-9232-0999dc418900	27347fd3-4ba1-4aeb-8b55-d601c8a1d4dd	John	JonnyBravo	1234567880	just a chill guy.	{}	\N	\N	0	\N	2026-01-20 03:47:57.094234	2026-01-20 03:47:57.094234
\.


--
-- Data for Name: creator_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.creator_transactions (id, creator_id, transaction_type, status, nwt_amount, description, earning_source, content_id, purchaser_user_id, source_user_transaction_id, gross_amount, platform_fee, platform_fee_percentage, withdrawal_method, withdrawal_address, withdrawal_fee, external_transaction_id, processed_at, failure_reason, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: device_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.device_tokens (id, reader_id, token, platform, created_at) FROM stdin;
eebc6e7f-07d1-4b47-9189-59879199da05	9cca51b0-fd9c-410b-a2b7-12013fa9fac2	ExponentPushToken[pYJZYRGh07ca_TNJe3Cy8B]	android	2026-01-24 12:21:34.196649
ea7bc4ee-deec-4d91-9066-56515cc394c8	9cca51b0-fd9c-410b-a2b7-12013fa9fac2	ExponentPushToken[pYJZYRGh07ca_TNJe3Cy8B]	android	2026-01-24 12:21:57.492618
de2535d6-fd57-4402-9ce8-c91ce79d727b	9cca51b0-fd9c-410b-a2b7-12013fa9fac2	ExponentPushToken[pYJZYRGh07ca_TNJe3Cy8B]	android	2026-01-24 12:22:38.211171
dd5520e6-834a-4b06-8f94-6d4b74d03a34	9cca51b0-fd9c-410b-a2b7-12013fa9fac2	ExponentPushToken[Im-1cmGhbZOnwYi9wvthLl]	android	2026-01-24 14:56:51.013454
47d0c601-dd07-4466-9dff-1eda99a4fc3f	9cca51b0-fd9c-410b-a2b7-12013fa9fac2	ExponentPushToken[Im-1cmGhbZOnwYi9wvthLl]	android	2026-01-24 15:49:10.375772
04b8b65f-edae-438e-9ea9-860589eb8d6f	9cca51b0-fd9c-410b-a2b7-12013fa9fac2	ExponentPushToken[rc0M91EXiKW8gKyXxHYLuK]	android	2026-01-24 16:03:10.065049
8e6b25d4-5864-48b6-9e43-c0eb306c619b	9cca51b0-fd9c-410b-a2b7-12013fa9fac2	ExponentPushToken[rc0M91EXiKW8gKyXxHYLuK]	android	2026-01-24 18:45:57.522415
\.


--
-- Data for Name: library; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.library (id, reader_id, comic_id, created_at, updated_at) FROM stdin;
7a2f0326-418a-4684-8401-9c669bb5a23c	0eea9054-b7a7-474d-839d-aed4ff75acd8	1f6b92ab-205c-48dc-89c5-c473f033e08d	2025-10-08 17:07:56.84314	2025-10-08 17:07:56.84314
22caf534-53a7-45dc-a938-498e858e512f	0c1864a3-851b-4a76-8f19-b9c82c199264	1f6b92ab-205c-48dc-89c5-c473f033e08d	2025-10-11 12:42:22.020927	2025-10-11 12:42:22.020927
5c365b5a-de45-419b-970e-aa77773c0ab1	36847d5a-dd9b-4463-ac3e-4a34c0269623	dd26b871-1e92-4312-9fdb-3696acab151f	2025-11-04 13:57:31.941633	2025-11-04 13:57:31.941633
98c9abef-36fe-4b26-8182-3246b2e9136e	f9768ec1-279c-4038-a426-f3f960099759	2d15f682-3892-4e19-9c69-0c7819bf5f7a	2025-11-09 07:38:57.263128	2025-11-09 07:38:57.263128
1c2c9134-3a2c-431a-8507-777f9a0308b8	4b338dcc-6ab6-4e44-96a2-b2b1475c6b3b	dd26b871-1e92-4312-9fdb-3696acab151f	2025-11-10 10:51:44.113104	2025-11-10 10:51:44.113104
0bc31aa3-59e7-41b3-9a84-e0c7bf40eaa9	f9768ec1-279c-4038-a426-f3f960099759	1f6b92ab-205c-48dc-89c5-c473f033e08d	2026-01-24 15:56:26.476541	2026-01-24 15:56:26.476541
\.


--
-- Data for Name: loyalty_points; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.loyalty_points (id, user_id, points, last_updated) FROM stdin;
\.


--
-- Data for Name: marketplace_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketplace_config (id, platform_fee_percentage, minimum_listing_price, maximum_listing_price, is_marketplace_active, allow_royalties, metadata, created_at, updated_at) FROM stdin;
286a3b70-a257-4381-a1b6-bbfa5e60cf13	2.00	1.00	1000000.00	t	t	\N	2026-01-09 21:08:03.773432	2026-01-09 21:08:03.773432
\.


--
-- Data for Name: marketplace_escrow; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marketplace_escrow (id, seller_id, total_earnings, total_withdrawn, available_balance, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: nft_listings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nft_listings (id, nft_id, mint_address, seller_id, seller_wallet_address, price, royalty_percentage, title, description, status, listed_at, sold_at, cancelled_at, metadata, created_at, updated_at) FROM stdin;
4204e559-9d82-466b-ad04-3f3d52ee0ba6	228a1ad5-6af7-400c-a5af-30fcd2c4f8b8	TestMintAddress123456789ABC	ffffffff-ffff-ffff-ffff-ffffffffffff	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	50.00	0.00	Self Purchase Test	\N	active	2026-01-10 18:45:56.485564	\N	\N	\N	2026-01-10 18:45:56.485564	2026-01-10 18:45:56.485564
535f0ef4-8ed1-4114-a858-246bdd051e9a	f68bf2e3-4547-444c-8074-3c27cebd9445	TestMintAddress123456789ABC	ffffffff-ffff-ffff-ffff-ffffffffffff	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	50.00	0.00	Self Purchase Test	\N	active	2026-01-10 18:50:43.277993	\N	\N	\N	2026-01-10 18:50:43.277993	2026-01-10 18:50:43.277993
\.


--
-- Data for Name: nft_marketplace_transfers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nft_marketplace_transfers (id, order_id, nft_id, from_wallet_address, to_wallet_address, transaction_hash, status, metadata, created_at, completed_at) FROM stdin;
28c5ec06-42d9-48bd-830b-e65f6ed396bb	98d01fd6-b699-4af4-910b-2c096df6daa9	96f8033a-c3c2-4ead-a2a2-46aff8d188c6	7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	TEST_SIGNATURE_1768033552699	completed	\N	2026-01-10 08:25:46.648778	\N
f6780f1e-6c9d-4f43-a4f4-f75b7d21ce4e	2b4abdcf-5e6c-4a5f-bd39-2a716d6fdcfe	3aed7b34-41fe-4e38-a156-6c7b7e637054	7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	TEST_SIGNATURE_1768033726394	completed	\N	2026-01-10 08:28:40.185582	\N
9cb16ad8-3c64-4934-b9ef-b31e9e0ca33c	f7b6282f-9f06-45ce-a832-95fc9b8db40c	e76a4100-240a-41f7-8645-dd73fe22dbf4	7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	TEST_SIGNATURE_1768070840483	completed	\N	2026-01-10 18:47:13.742872	\N
7152d2ce-2f1a-4091-ac93-703cdd01d987	57637994-a694-45e3-afb2-d0576e19ecf2	419df607-d0f2-4737-a8be-54169f87c5c4	7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	TEST_SIGNATURE_1768071182106	completed	\N	2026-01-10 18:52:55.872558	\N
fc707707-7ea4-465e-8650-cc754fb7f5d0	1a5166c6-4544-4f18-85ff-39a8a1408ed4	2c2d45ea-0204-43e4-b429-ccb87b341a08	7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	TEST_SIGNATURE_1768071224716	completed	\N	2026-01-10 18:53:38.641592	\N
\.


--
-- Data for Name: nft_order_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nft_order_transactions (id, order_id, buyer_id, transaction_type, status, total_amount, platform_fee_amount, seller_amount, royalty_amount, description, failure_reason, metadata, created_at, updated_at) FROM stdin;
f8381482-0f37-4601-864b-cba4a738034c	98d01fd6-b699-4af4-910b-2c096df6daa9	eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	marketplace_purchase	completed	100.00	2.00	93.00	5.00	NFT Purchase: Test Comic NFT #1	\N	\N	2026-01-10 08:25:46.648778	2026-01-10 08:25:46.648778
e76e63d3-bf4e-4b2e-894a-23233f740bdc	2b4abdcf-5e6c-4a5f-bd39-2a716d6fdcfe	eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	marketplace_purchase	completed	100.00	2.00	93.00	5.00	NFT Purchase: Test Comic NFT #1	\N	\N	2026-01-10 08:28:40.185582	2026-01-10 08:28:40.185582
d0fba95b-1dec-4ead-88db-828206d703f2	f7b6282f-9f06-45ce-a832-95fc9b8db40c	eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	marketplace_purchase	completed	100.00	2.00	93.00	5.00	NFT Purchase: Test Comic NFT #1	\N	\N	2026-01-10 18:47:13.742872	2026-01-10 18:47:13.742872
28bcc162-277c-4729-8f3a-23597e810783	57637994-a694-45e3-afb2-d0576e19ecf2	eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	marketplace_purchase	completed	100.00	2.00	93.00	5.00	NFT Purchase: Test Comic NFT #1	\N	\N	2026-01-10 18:52:55.872558	2026-01-10 18:52:55.872558
f0620dcf-1b1d-4b84-a453-2833540381cb	1a5166c6-4544-4f18-85ff-39a8a1408ed4	eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	marketplace_purchase	completed	100.00	2.00	93.00	5.00	NFT Purchase: Test Comic NFT #1	\N	\N	2026-01-10 18:53:38.641592	2026-01-10 18:53:38.641592
\.


--
-- Data for Name: nft_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nft_orders (id, listing_id, nft_id, mint_address, buyer_id, buyer_wallet_address, seller_id, seller_wallet_address, purchase_price, platform_fee_amount, royalty_amount, seller_amount, transaction_id, status, blockchain_tx_hash, metadata, created_at, completed_at, cancelled_at) FROM stdin;
98d01fd6-b699-4af4-910b-2c096df6daa9	64ccd4f8-b7c9-4e4c-8dc2-30edddc6743a	96f8033a-c3c2-4ead-a2a2-46aff8d188c6	3yJKwWGR9vyEoHSPjC2pJCHsyZnhb6tP5xYaYLQQcKfR	eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	cccccccc-cccc-cccc-cccc-cccccccccccc	7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU	100.00	2.00	5.00	93.00	5e6c03b5-ee65-4b85-bb80-afec639585df	completed	\N	\N	2026-01-10 08:25:46.648778	2026-01-10 08:25:51.115	\N
2b4abdcf-5e6c-4a5f-bd39-2a716d6fdcfe	23c15fbc-9b65-4e44-85e5-3da46cc5400d	3aed7b34-41fe-4e38-a156-6c7b7e637054	3yJKwWGR9vyEoHSPjC2pJCHsyZnhb6tP5xYaYLQQcKfR	eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	cccccccc-cccc-cccc-cccc-cccccccccccc	7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU	100.00	2.00	5.00	93.00	5cf62ba8-d59f-4e3e-9a6f-eb534a91f368	completed	\N	\N	2026-01-10 08:28:40.185582	2026-01-10 08:28:44.819	\N
f7b6282f-9f06-45ce-a832-95fc9b8db40c	29d29dd4-a5c6-47e9-b1e2-bc5ac921adbc	e76a4100-240a-41f7-8645-dd73fe22dbf4	3yJKwWGR9vyEoHSPjC2pJCHsyZnhb6tP5xYaYLQQcKfR	eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	cccccccc-cccc-cccc-cccc-cccccccccccc	7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU	100.00	2.00	5.00	93.00	9dbd8ae0-d9c2-4f60-8830-78e4a2ed402c	completed	\N	\N	2026-01-10 18:47:13.742872	2026-01-10 18:47:18.725	\N
57637994-a694-45e3-afb2-d0576e19ecf2	a5807dcf-f858-48b8-aeac-1ec0b099d74f	419df607-d0f2-4737-a8be-54169f87c5c4	3yJKwWGR9vyEoHSPjC2pJCHsyZnhb6tP5xYaYLQQcKfR	eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	cccccccc-cccc-cccc-cccc-cccccccccccc	7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU	100.00	2.00	5.00	93.00	2768ed64-8812-410d-a94d-9ef8fb8f126a	completed	\N	\N	2026-01-10 18:52:55.872558	2026-01-10 18:53:00.376	\N
1a5166c6-4544-4f18-85ff-39a8a1408ed4	9cb7cfde-00d1-4423-aead-3f30346b5a1d	2c2d45ea-0204-43e4-b429-ccb87b341a08	3yJKwWGR9vyEoHSPjC2pJCHsyZnhb6tP5xYaYLQQcKfR	eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee	DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK	cccccccc-cccc-cccc-cccc-cccccccccccc	7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU	100.00	2.00	5.00	93.00	0b5af302-c828-42e2-ad79-22041c888d0e	completed	\N	\N	2026-01-10 18:53:38.641592	2026-01-10 18:53:43.051	\N
\.


--
-- Data for Name: nft_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nft_transactions (id, user_wallet_id, transaction_type, category, amount, balance_before, balance_after, reference_id, reference_type, description, metadata, blockchain_tx_hash, status, processed_at, created_at) FROM stdin;
\.


--
-- Data for Name: nft_transfer_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nft_transfer_history (id, nft_id, from_user_wallet_id, to_user_wallet_id, from_wallet_address, to_wallet_address, transaction_hash, status, created_at) FROM stdin;
\.


--
-- Data for Name: nfts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nfts (id, user_wallet_id, collection, nft_type, mint_address, price, is_limited_edition, amount, metadata, status, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, reader_id, type, comic_id, chapter_id, title, body, is_read, created_at) FROM stdin;
\.


--
-- Data for Name: nwt_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nwt_transactions (id, user_wallet_id, transaction_type, category, amount, balance_before, balance_after, reference_id, reference_type, description, metadata, blockchain_tx_hash, status, processed_at, created_at) FROM stdin;
\.


--
-- Data for Name: paid_Chapters; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."paid_Chapters" (id, reader_id, chapter_id, paid_at, updated_at) FROM stdin;
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_resets (id, user_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, user_wallet_id, amount, currency, nwt_amount, exchange_rate, webhook_id, payment_intent_id, blockchain_tx_hash, status, failure_reason, metadata, processed_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: reader_profile; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reader_profile (id, user_id, full_name, genres, wallet_id, wallet_balance, pin_hash, created_at, updated_at) FROM stdin;
d72bb5b0-e689-4084-96ce-4d3535e3ec42	27347fd3-4ba1-4aeb-8b55-d601c8a1d4dd	John Doe	{Romance,Horror,Drama,Superhero}	05742dfd6c1e	0	\N	2025-09-29 10:26:09.058133	2025-09-29 10:26:09.058133
9cca51b0-fd9c-410b-a2b7-12013fa9fac2	533286d4-a228-4f62-9bf6-53006062507f	John Doe	{romance,adventure,sci-fi}	f6109de1fe6f	0	\N	2025-09-29 10:26:14.602875	2025-09-29 10:26:14.602875
2f59c6bc-718c-4952-ba5b-39336e8cfd03	8594bfb4-e524-4e5b-86f2-ba158b0bdd4a	Onunwor Ebube	{Fantasy}	ad6fbb9f77dc	0	\N	2025-09-29 11:24:17.339661	2025-09-29 11:24:17.339661
f9768ec1-279c-4038-a426-f3f960099759	ad82da70-db6a-402c-9830-1af81790b0e6	philip khristos	{Fantasy,"Science Fiction"}	7e207e0ff760	0	\N	2025-09-29 14:39:25.247066	2025-09-29 14:39:25.247066
7541c1d4-d31b-4e58-a664-cb5d38e4e6b6	e116ed48-5fb1-4ffe-9445-da666f244896	Benny Asitonka-Joe 	{"Science Fiction",Thriller,Adventure,"Historical Fiction",Western}	2d8348a65cde	0	\N	2025-09-29 15:16:36.851015	2025-09-29 15:16:36.851015
4a800a4e-cadb-4437-b9a4-6b4b13711339	c1c1fefb-93e1-4057-89d0-d5bf3d0e4c88	Victor Ezealor 	{Romance,Thriller,Superhero,Western,Drama,Horror,Comedy,Biographical,"Science Fiction",Fantasy}	fe3e85f8eb8c	0	\N	2025-09-30 21:17:21.233802	2025-09-30 21:17:21.233802
469769e1-1f35-4e65-aa05-95b649d10c2e	cd9c659b-5b47-4d2f-aa4c-af151f4943aa	Anonymous	{Comedy,Fantasy}	c1fd6a881871	0	\N	2025-10-01 08:50:38.773214	2025-10-01 08:50:38.773214
36847d5a-dd9b-4463-ac3e-4a34c0269623	f002b0a8-2b15-4bfe-81d9-42d4ffe43846	Dilo 	{Drama,Comedy,"Historical Fiction",Romance,Mystery,Thriller,Fantasy}	4a10b3eb0966	0	\N	2025-10-01 11:12:38.624895	2025-10-01 11:12:38.624895
79a8efb7-e8ea-4eb9-99b1-0b2cd288df04	a8f6dea1-b805-490c-aa77-1f063ecc3de4	Edesemi Makio	{Fantasy,"Science Fiction",Western,Comedy}	0d6a22b3510f	0	\N	2025-10-01 20:41:59.325043	2025-10-01 20:41:59.325043
4ced713e-3eef-4033-8902-5099a8e68b8e	77dfae30-b9be-412f-bc68-f286e6f45a1b	Jessie Carter	{}	6825b34add31	0	\N	2025-10-02 08:25:46.526295	2025-10-02 08:25:46.526295
2c331cb2-9539-4095-b5d0-b0844ed9b83c	030987ef-ce97-479e-9c8a-c7f8f5a62d8c	Victor Ihechi	{Fantasy,"Science Fiction",Adventure}	13a9351dd51d	0	\N	2025-10-02 17:14:29.71277	2025-10-02 17:14:29.71277
887e566e-b448-4538-bf89-d8d1e0a7128d	e7575adb-20d0-426d-9c68-b5337f34a1d6	Sol Invictus	{Fantasy}	e3638381062d	0	\N	2025-10-02 20:30:04.314657	2025-10-02 20:30:04.314657
c0eab1f0-1fd1-4152-a263-1933a0a35c13	89e1ad68-8844-499e-932d-dcf214fdc5b2	Alare Petra	{Romance,Superhero,Comedy,Mystery}	957785a6d99e	0	\N	2025-10-02 20:55:01.782895	2025-10-02 20:55:01.782895
77e74237-5a5a-4b36-acc6-59b245da323b	39ee6cef-d517-4c64-8f47-c53d8b78c577	Jackson Godwin 	{Fantasy,Adventure,Superhero,Comedy,Horror}	3864e28030b2	0	\N	2025-10-03 21:28:10.744955	2025-10-03 21:28:10.744955
6dc2bbc4-0066-43b4-abff-0d152a182e78	d42fb868-991a-43b3-b197-0291debc1722	Daniel Anders	{Fantasy,"Science Fiction",Thriller,Adventure,"Historical Fiction",Superhero,Western}	b23df876fcf8	0	\N	2025-10-04 12:52:13.191323	2025-10-04 12:52:13.191323
78ed4151-5647-4b0a-afc1-1e7ffcde3615	291f1cea-5ecb-4fa4-82c2-f78218f14f31	Candytemi	{Fantasy,Romance,Mystery,Horror,Thriller,Adventure,"Historical Fiction",Comedy,Drama,Western,"Science Fiction"}	5cd96668aa48	0	\N	2025-10-04 20:54:15.995675	2025-10-04 20:54:15.995675
ce45aeac-e832-436a-8beb-6eef0709e061	bfc297a7-19c7-4459-ae68-9c0c619525c2	Amanda	{Fantasy,"Science Fiction",Drama,"Historical Fiction"}	213cdcb41de8	0	\N	2025-10-05 09:48:33.042762	2025-10-05 09:48:33.042762
3255b0bf-719d-4203-83f2-1489bbaf7b1c	1d02c390-3b1b-441c-9299-b5996da32f5c	Edward Valentine	{Fantasy,Comedy,Adventure,Mystery,"Science Fiction",Superhero,Musical,Romance}	8ea44ff3cd44	0	\N	2025-10-05 15:04:38.857232	2025-10-05 15:04:38.857232
3df63e37-2c6c-4e8c-b3c8-ec3a129e606f	6aca96ae-ed48-4b6c-9bb8-3ec999c6b8e0	phoenixdahdev	{Fantasy,"Science Fiction",Mystery,Romance}	15f774e96504	0	\N	2025-10-07 08:08:23.391036	2025-10-07 08:08:23.391036
03f19154-4117-4910-8c20-a553a527626f	d4fa0737-edff-491c-a339-c690a9f66cd8	Ezii Jude	{Comedy}	3599928ab556	0	\N	2025-10-07 09:50:14.054998	2025-10-07 09:50:14.054998
b12ad82b-4951-4be8-b10d-33cde4e5632b	ee082cd4-0961-4f51-98c9-5fc6f423a449	Gideon Archibong 	{"Science Fiction",Adventure,Mystery,Superhero,Drama,Musical,Comedy,Cyberpunk,Thriller,Fantasy}	d4207abe0365	0	\N	2025-10-07 16:24:09.712824	2025-10-07 16:24:09.712824
e577cae2-d005-43ed-8a7f-f9573fa95509	8e09069f-e168-4cec-b1e9-1714e99da95e	Victor Uzoma	{Fantasy}	0e94152b27a7	0	\N	2025-10-07 19:48:42.215455	2025-10-07 19:48:42.215455
9f64bb4a-5373-4754-9ae3-7c3960f489d2	dc956caa-d5de-4a49-8561-7a2286d9dddb	Violet Benson	{Fantasy,"Science Fiction",Mystery,Thriller,Romance,Adventure,Western,Cyberpunk,Dystopian,Comedy,Biographical,"Historical Fiction"}	f82fd878e72d	0	\N	2025-10-07 22:13:49.28466	2025-10-07 22:13:49.28466
3127d939-6acc-40bf-a4c7-338706691f04	f3b808fb-d5f1-4b85-85ad-9c9802d1016c	Marvellous Samuel 	{Fantasy,"Science Fiction",Mystery,Thriller,Horror,Romance,Adventure,Comedy,Drama,Superhero,Dystopian,Western,Cyberpunk}	8943c190c19a	0	\N	2025-10-08 13:38:10.646078	2025-10-08 13:38:10.646078
0eea9054-b7a7-474d-839d-aed4ff75acd8	4109756c-ca32-4bd3-9d06-56d5f98c0d96	Dan-EL 	{Fantasy,Superhero}	4191e9ff48ca	0	\N	2025-10-08 17:06:45.797425	2025-10-08 17:06:45.797425
011f101a-319a-40ca-ab4a-d3c5e95aacb3	b73dc977-85a8-4141-8a2e-edb3b2465086	Emmy Ileson	{Fantasy,Comedy,Cyberpunk}	5292c987ba12	0	\N	2025-10-08 21:42:50.238052	2025-10-08 21:42:50.238052
76f72226-942d-4438-857a-e9ddf2f37034	67ade92d-92ec-407c-8020-6a24e2fd4414	philip alare	{Western,Drama,Adventure,Mystery}	a11dfcb33c04	0	\N	2025-10-09 14:25:06.0733	2025-10-09 14:25:06.0733
2e7c8379-bef6-4ab8-acef-9cc445bdefc5	701e0154-4d41-46f0-83c9-8583c6c054a6	Rukevwe	{Fantasy,Superhero,"Science Fiction",Cyberpunk,Comedy,Adventure}	bdaf4adf7e1b	0	\N	2025-10-10 11:37:10.270119	2025-10-10 11:37:10.270119
efb92a10-acc7-43c0-b8f8-f40c114265fa	5de4c82e-a30b-46d6-99cc-6f9b13962b70	Dosdee	{Horror,Comedy,Adventure,Romance,Mystery,Superhero,Thriller,"Science Fiction"}	cfd07669d177	0	\N	2025-10-10 19:42:02.236016	2025-10-10 19:42:02.236016
23386f69-0ed6-477f-8a27-4c8c68c6479e	34c0211b-db59-4521-94bb-5601535ad074	Ejiro Okpako	{Mystery,Fantasy,Thriller,Horror,Adventure,"Historical Fiction",Superhero}	1546e9eba0ba	0	\N	2025-10-10 20:10:56.40118	2025-10-10 20:10:56.40118
ac449bba-831e-41e4-ae49-6775c14a927a	a209d492-a47f-4b00-a2f4-e5a44acc3130	Robinsui baby	{Romance,Fantasy}	c009e25b20b0	0	\N	2025-10-11 00:59:33.228825	2025-10-11 00:59:33.228825
0ca4e560-ce1c-43dd-bcf3-06b70c48f688	99192e36-b64b-4f3b-9eb1-9917cdaf8e1d	Jason Robert	{Horror,Fantasy,Romance,"Science Fiction",Superhero,Dystopian,"Historical Fiction",Comedy,Mystery,Adventure}	8c0b65ac2ff2	0	\N	2025-10-11 07:51:44.567308	2025-10-11 07:51:44.567308
f4dfa2bb-18e1-44e9-83de-8a63d032cefd	9a825b78-2c74-4348-b53e-558747d1cdce	Ade Gbadebo 	{Fantasy,Romance,Comedy,Drama,Musical,Biographical,Mystery}	6f5048cf4ab1	0	\N	2025-10-11 08:55:30.3188	2025-10-11 08:55:30.3188
ac69ae8a-c771-4b8f-9fc0-be49daaee356	8011f220-2e94-4869-9d75-ea79ab394638	Ray Ukoh 	{Fantasy,Mystery,Thriller,Horror,Adventure}	1cc0bc917ca7	0	\N	2025-10-11 10:36:01.852015	2025-10-11 10:36:01.852015
0c1864a3-851b-4a76-8f19-b9c82c199264	ebb03d8f-2f05-4e8b-9eee-51138d02928d	Raji Mahmud 🔥 🎗 	{"Science Fiction",Adventure,Cyberpunk,Superhero,Thriller,Romance}	38b249001df8	0	\N	2025-10-11 12:38:04.614212	2025-10-11 12:38:04.614212
5f0ee127-4706-417c-9964-22914aeabe78	7fd9c303-9a9e-45ec-af47-f1f09bb6deb8	Sheriff Moses	{Fantasy,Romance,Drama,Musical}	c9868404e7fc	0	\N	2025-10-11 13:22:34.122899	2025-10-11 13:22:34.122899
bb2afb85-7da3-4f37-9b08-5eac24a49ef2	018b3df0-8716-43de-9e3a-d371710346b6	Yvgeny Bulgoyabuff	{Fantasy,"Science Fiction",Thriller,Adventure}	466bc9885177	0	\N	2025-10-11 14:03:31.812	2025-10-11 14:03:31.812
39b52168-3277-404c-89e6-caa673db7451	f4f5c654-0c05-4963-905b-00cd4bbd7ca4	Leo	{Superhero,Comedy,Mystery,"Science Fiction",Fantasy}	ea30cb1d98d5	0	\N	2025-10-11 14:23:08.332823	2025-10-11 14:23:08.332823
ffc5360c-79e7-469f-89e7-239ccfa49048	6bd79aef-c6ce-4f35-8f49-c71f66fabdf1	Joe Lani	{"Historical Fiction",Thriller,"Science Fiction",Mystery,Musical,Horror}	71a6fc9ef33a	0	\N	2025-10-11 14:33:37.768624	2025-10-11 14:33:37.768624
ea235deb-4262-4178-87f3-b7a18bd98079	393035b6-0ed8-4b63-824e-da0010d24ab7	Kharay KrayKray	{"Science Fiction",Mystery,Thriller,Horror}	c6432d413907	0	\N	2025-10-11 16:46:33.571224	2025-10-11 16:46:33.571224
16d215c2-e2f4-4131-83f0-b16cf3a34571	61d7909d-a5dc-4b26-834f-8f7104c6330b	Emmy Brown 	{Fantasy,Thriller,Horror,"Science Fiction",Mystery,Drama}	a1346a5f393f	0	\N	2025-10-11 17:24:13.046211	2025-10-11 17:24:13.046211
b7b35fab-737a-48fa-9df4-6395bf6307c1	fbf3130a-7016-409e-844b-a89272bcbcee	AbdulQahar Olajide 	{Superhero,Biographical,Western,Adventure,Mystery,Drama,Musical,Cyberpunk,Dystopian,Comedy,Horror,"Science Fiction",Thriller,"Historical Fiction",Romance,Fantasy}	fbbb8aa8055a	0	\N	2025-10-11 18:11:23.553104	2025-10-11 18:11:23.553104
d99682ea-edba-4cac-805a-52f47c963773	4ee98256-5010-45e4-9036-983857a33248	Abdulrahmon Adebayo	{"Science Fiction",Romance,Thriller,Adventure,Comedy,Biographical,Drama,"Historical Fiction"}	3f51ff2ec899	0	\N	2025-10-11 18:41:09.444789	2025-10-11 18:41:09.444789
02972dc7-ce1d-4a02-951e-f6b618f8352d	810d8b96-d4b6-4412-b2c8-a1942038d29a	Opeyemi Eniola 	{Superhero,"Science Fiction",Comedy,Mystery,Fantasy,Thriller}	f8a7e7707cc3	0	\N	2025-10-11 18:47:48.056285	2025-10-11 18:47:48.056285
72ffba8b-091e-4ebb-bfce-a965ab928b85	e4b8ab68-6d78-437f-becc-eccf3cb1b853	Cmdliner	{Fantasy,"Science Fiction",Dystopian,Adventure,Thriller,"Historical Fiction",Mystery}	cabcf9350a90	0	\N	2025-10-11 19:41:49.225542	2025-10-11 19:41:49.225542
acf4dd3b-fe86-400a-9525-e3b77e89b808	6b1ad98f-c58d-4cf9-9809-580eea6aaca2	Ezekiel 	{Drama,Fantasy,"Science Fiction",Mystery,Adventure,Horror,Thriller,Comedy,Cyberpunk,Superhero,"Historical Fiction",Romance}	864ef65e059b	0	\N	2025-10-11 22:10:26.780369	2025-10-11 22:10:26.780369
dd4c9ad9-7c1d-4aa8-8849-6db6026ee2f7	4a5d51fc-ebd5-48cb-8c77-1e393573412c	Tobiloba 	{"Science Fiction",Fantasy,Mystery,Thriller,Horror,Adventure,"Historical Fiction",Comedy,Drama,Dystopian,Superhero,Western,Cyberpunk}	8eaa09513bb9	0	\N	2025-10-12 05:49:37.30667	2025-10-12 05:49:37.30667
e4b02423-5164-471c-b102-faf493f5a041	8070a9c6-1f31-44a5-b90b-90b31ab9abd1	Confidence Chinwor	{Fantasy,"Science Fiction",Adventure}	5355287a4471	0	\N	2025-10-12 12:50:33.188264	2025-10-12 12:50:33.188264
24d3d5a4-1969-4120-9d2a-07884d5ab82c	dd402d62-e49e-411b-a9a2-294472cc0e67	Believe 	{Mystery,Comedy,"Science Fiction",Adventure,Musical}	177e97395b89	0	\N	2025-10-13 09:43:26.977022	2025-10-13 09:43:26.977022
4ae241af-f120-41f2-907d-42c1d894e86c	fba76982-704d-4e0a-a547-188739962609	VeeKaXin	{"Science Fiction",Comedy,Adventure,Romance,Fantasy,Drama}	32133d606501	0	\N	2025-10-16 05:59:00.029894	2025-10-16 05:59:00.029894
40a65594-469a-41e5-a35c-0a554fd41020	dd97a64c-86fe-4ec8-8f48-8403b0784729	Mom	{"Science Fiction","Historical Fiction",Dystopian,Drama}	a736eaa68a82	0	\N	2025-10-16 18:19:51.015953	2025-10-16 18:19:51.015953
9a33247d-66f8-4ebe-ae59-04f8cc5dfef3	1874f1f6-fca3-4f41-bd86-30e6e3368a28	Uyiosa Osagie 	{Adventure,Mystery,Comedy,Superhero,"Science Fiction",Cyberpunk,Drama}	ba5d3db3f67a	0	\N	2025-10-18 07:49:21.521614	2025-10-18 07:49:21.521614
33ab7934-418f-4c54-b61c-c0c9a2c868ac	dcec92a4-4fb9-4ff2-b0d0-107801380271	Diggie D. Scribe	{Fantasy,"Science Fiction",Mystery,Thriller,Romance,Adventure,Horror,"Historical Fiction",Comedy,Drama,Dystopian,Superhero,Biographical,Western,Musical,Cyberpunk}	d4741396a401	0	\N	2025-10-18 08:09:47.603719	2025-10-18 08:09:47.603719
3cbad6c2-2c3f-4786-ab99-26752e680a07	f7f7930c-178c-4da8-b31b-9c6be4b53ca4	TheRedAndBlueYakuza	{Cyberpunk,Superhero,Horror,Adventure,Fantasy,Thriller}	bc0600387739	0	\N	2025-10-18 08:27:57.452076	2025-10-18 08:27:57.452076
4d38918b-97e2-488e-8abe-ee73d53b692a	424cc417-d81b-4582-8616-b3cffd4e977a	Bech	{Fantasy,Superhero}	14b6f4b8a8e6	0	\N	2025-10-18 08:30:35.138685	2025-10-18 08:30:35.138685
4375f19d-7403-462a-adc2-9d6cdfa33051	7c849698-abb7-4b5e-a07f-c3571a1c5b2a	Afiegha Harry Ochuko 	{Fantasy,Mystery,Dystopian,"Historical Fiction",Adventure}	4913044c8a34	0	\N	2025-10-18 08:45:14.028556	2025-10-18 08:45:14.028556
e01ef458-900e-4f06-b02f-d9cafd4e569a	c34b21d2-d9e0-4ef7-800f-2347eaec244b	Blossom Akpojisheri	{Biographical,Fantasy,"Science Fiction",Horror,Mystery,Adventure,"Historical Fiction",Dystopian,Western,Cyberpunk,Thriller,Superhero}	14fd25d4b908	0	\N	2025-10-18 08:48:15.978052	2025-10-18 08:48:15.978052
939f8ddc-5345-4982-bc8e-06a581342b9b	3eb0a7c0-b23d-496f-83a4-436ba285b679	Elijah Agbolabori	{Superhero}	9ba83e5aa78e	0	\N	2025-10-18 09:07:09.400515	2025-10-18 09:07:09.400515
fd03155a-a16e-4070-94bb-a3d6f035adc8	9043c393-c9f5-4f8e-8aae-14d295d2e2e3	ปรมินทร์ โนนศรีชัย	{Fantasy,Adventure,Mystery,Drama,Dystopian,Cyberpunk}	f46a6fe8a626	0	\N	2025-10-18 09:42:39.922697	2025-10-18 09:42:39.922697
60eb8321-f8e2-4cad-bf43-ccd4c65440cb	ae92d788-d289-47bd-b5f9-8b858508422e	Chil_guy	{Fantasy,Horror,"Science Fiction",Superhero,Western,Cyberpunk,Adventure,Mystery,Thriller}	f45b05ce3af2	0	\N	2025-10-18 10:11:26.418296	2025-10-18 10:11:26.418296
0cf85ad6-6978-4114-a586-fb8f201d1d88	d4210ab4-ddaa-45d1-ada1-9c710e1a54e3	Chibuokem Chiorlu	{}	3ccd8e666010	0	\N	2025-10-18 15:20:57.344607	2025-10-18 15:20:57.344607
83991ac0-9094-424a-8a9b-4c70235b200b	deddfdbe-22e9-48cf-b651-fdfeeb294624	CLaM_ArT	{Horror,Fantasy,Superhero,Western,Cyberpunk,Dystopian,Comedy,Adventure,"Science Fiction",Thriller}	0f1a52c78596	0	\N	2025-10-19 06:10:43.041401	2025-10-19 06:10:43.041401
69d30b6a-332d-4f91-bc62-4a04a075c764	6ff6cde8-b10c-4d34-b696-5837a993eb7a	Divine Silas	{Fantasy,"Science Fiction","Historical Fiction",Horror,Adventure,Cyberpunk,Mystery}	6c9b1ca7ffa2	0	\N	2025-10-19 14:32:53.204112	2025-10-19 14:32:53.204112
0d7507b4-261c-49d1-864b-dce939cf3c49	0f7087ff-a446-4b2c-9383-491c96d32cf6	divine!	{Fantasy,"Science Fiction",Mystery,Adventure,Dystopian}	1630fef856da	0	\N	2025-10-20 01:27:59.220377	2025-10-20 01:27:59.220377
c97f947b-627b-4086-919c-7fa8ed8015a8	650a188b-a51f-4c9e-8834-2e3021423d0e	Mad Marvin	{Fantasy,"Science Fiction",Mystery,Romance,Thriller,Horror,Adventure,"Historical Fiction",Comedy,Drama,Superhero,Dystopian,Musical,Western,Biographical,Cyberpunk}	f7b63007da10	0	\N	2025-10-20 19:21:25.906111	2025-10-20 19:21:25.906111
ee993630-6476-4a5c-a4b6-912d3161a877	97a38989-589f-4136-9509-90a65314612b	UC	{Fantasy,Mystery,Cyberpunk,Adventure,"Historical Fiction","Science Fiction"}	020556be816d	0	\N	2025-10-20 22:41:23.119573	2025-10-20 22:41:23.119573
d6d96f1d-f8df-49cf-a85b-257211c80786	e30b3666-d77b-4a8e-8514-ff138c9d844f	Edoora	{Fantasy,Romance,Mystery,"Science Fiction",Adventure,"Historical Fiction",Thriller,Horror,Superhero}	b6c3a6de4d5e	0	\N	2025-10-20 22:47:43.949161	2025-10-20 22:47:43.949161
7d22c452-8903-4b70-8a81-6efc5fdcc386	57ba8a82-1c2b-4a62-a3b8-9e01e780c3ab	Harry wealth	{Fantasy,"Science Fiction",Mystery,Horror,Thriller,Adventure,Drama,Superhero,"Historical Fiction",Comedy,Western,Biographical}	0f4570d11713	0	\N	2025-10-21 13:25:09.50534	2025-10-21 13:25:09.50534
e082aabd-ba0e-40b8-be29-80e0ad14cde9	6a1290d4-ac65-4720-a320-c2d9b3ff7ae5	Chioma Blessing Akani 	{Fantasy,"Historical Fiction",Superhero}	d82669e2bb2b	0	\N	2025-10-23 13:14:23.095577	2025-10-23 13:14:23.095577
8e1e6a77-810c-418d-8a33-70ec0e3ad803	27f69dea-1159-461d-8ce8-661147c7d7ae	Udonna	{Thriller,"Historical Fiction",Biographical,Dystopian,Mystery,"Science Fiction",Adventure}	22633d35eec2	0	\N	2025-10-23 20:38:43.95848	2025-10-23 20:38:43.95848
5538559d-f1a8-4bc5-8854-39ea916e66e3	17bcc118-320b-4587-8d8d-99b34bd92ea1	Emmanuel Osikabor	{Fantasy,"Science Fiction",Mystery,Romance,Thriller,Horror,Adventure,Drama,Comedy,"Historical Fiction",Superhero,Dystopian,Musical,Cyberpunk,Biographical,Western}	7833acd36b59	0	\N	2025-10-25 12:19:01.285133	2025-10-25 12:19:01.285133
23e2f814-4bf0-4d48-84db-2fe69f5a269c	29245c6e-8546-41d8-9642-8cabae46f24a	Tumz	{Fantasy,Comedy,Superhero}	35e3bac657d5	0	\N	2025-10-25 12:27:54.485138	2025-10-25 12:27:54.485138
e7defdd2-f406-47ef-92df-15688257cbcc	c2bb4080-ea2f-42db-a08f-d155e67f8cff	Kosisochukwu Okeke	{Fantasy,"Science Fiction",Mystery,Adventure,Horror,Comedy,"Historical Fiction",Superhero,Cyberpunk,Dystopian,Western,Thriller}	14703c86ee1d	0	\N	2025-10-25 19:43:48.490124	2025-10-25 19:43:48.490124
380fc7c5-e993-4265-a7c8-1e6d83bdb536	a347c899-6600-4829-9844-66e13a29c291	Praise George	{Fantasy,Romance,"Historical Fiction",Dystopian,Biographical}	08385951852b	0	\N	2025-10-30 21:37:58.800834	2025-10-30 21:37:58.800834
b13e0d32-3ca7-4922-8f38-29a8325b7f0b	f5c2f71c-f7d7-41ec-bec1-694be82331d9	madaramf	{Adventure,Fantasy,Mystery,Comedy,Superhero}	41bdde239405	0	\N	2025-11-02 08:37:25.807267	2025-11-02 08:37:25.807267
16baa92c-5f91-4b82-a796-1f619ea07141	a7e226ae-b30b-486e-a03d-caa1076a9760	ugbeadie	{}	047f34fd3ca7	0	\N	2025-11-03 10:01:10.419299	2025-11-03 10:01:10.419299
d3bc0e57-8a24-41cc-bd0b-7142e89dca49	f28496c5-fb09-4103-8d72-ec520f8205dc	Chiagoziem Ofuani	{Fantasy,"Science Fiction",Dystopian,Comedy,Adventure}	3693906638a0	0	\N	2025-11-03 13:01:33.620501	2025-11-03 13:01:33.620501
c5cbd63c-f53d-43fc-878c-05f54e26aeb0	ed2c5df8-0fb9-4f02-a1e5-2f771681ee02	Tomisin	{Fantasy,"Science Fiction",Thriller,Comedy,Superhero,Western,Cyberpunk}	d7dfd3857e63	0	\N	2025-11-03 14:39:45.874824	2025-11-03 14:39:45.874824
0e6a85bc-5b89-4874-98b1-515ef8dacbb3	4fcbf50d-030f-40ff-be49-db8645529446	casmir	{Comedy}	109377bee65e	0	\N	2025-11-03 21:57:52.069333	2025-11-03 21:57:52.069333
22816500-cc63-4135-8d48-c769166cdda5	5b63220f-ef25-4a6a-9618-64aef8306f8e	thatweb3guy	{Superhero,"Science Fiction",Adventure,Cyberpunk}	ce99d4b22c9e	0	\N	2025-11-04 06:28:53.183079	2025-11-04 06:28:53.183079
7eb822b8-b951-4f68-928a-c607c7f2ffb5	4980079a-60d4-4c25-be6b-12440582f99d	oyin	{Romance}	96e054319b7d	0	\N	2025-11-04 10:01:26.218121	2025-11-04 10:01:26.218121
d6195fc1-2ec0-414d-a3a5-414fdc6dd286	f3f74ec9-df88-4649-942a-45fdad1eb2f8	Crista Davis	{Mystery,"Science Fiction",Thriller,Horror,Comedy,Drama,Superhero,Western,Adventure}	12a7369673ba	0	\N	2025-11-04 17:14:15.863848	2025-11-04 17:14:15.863848
ba1e5e25-2882-4500-880e-cb54f2192bca	a4d4baf7-5c03-4116-a0e5-cbfffbe6c071	Chimzi Chiorlu	{Fantasy,"Science Fiction",Mystery,Romance,Adventure,Comedy,Superhero}	e0e8ca6328bd	0	\N	2025-11-08 09:34:39.017884	2025-11-08 09:34:39.017884
43db3c9f-ba32-4de7-9b63-93e5006463fb	3f91f97b-0177-4679-88c2-6c7277a037da	Epicrand 	{Fantasy,Superhero,Adventure,Mystery,Horror,Thriller}	ee196f75e08e	0	\N	2025-11-10 10:46:22.929196	2025-11-10 10:46:22.929196
4b338dcc-6ab6-4e44-96a2-b2b1475c6b3b	5b3c9424-a44e-4b60-8e03-4e61eb9799e4	Mayamba	{"Science Fiction",Comedy,Drama}	b76289c6676c	0	\N	2025-11-10 10:47:06.057363	2025-11-10 10:47:06.057363
e63e8c1f-6a0c-4917-b587-f41ffe2647b4	e88a5a13-3369-4c11-9640-ff2e5bf71b40	Praise	{Fantasy,"Science Fiction",Mystery,Horror,Adventure,Superhero,Biographical,Cyberpunk}	d50b90d77f6b	0	\N	2025-11-11 14:13:26.64999	2025-11-11 14:13:26.64999
db63de50-c73e-4d27-8173-b9a81524beeb	f266fd42-1603-4e44-b0d4-07870510fcd6	Donald Michael	{"Science Fiction",Fantasy,Romance}	4b188fea6718	0	\N	2025-11-15 07:17:39.062129	2025-11-15 07:17:39.062129
483950e8-c175-4b1e-8d51-0414dbf82532	58d876c4-380e-413b-a62e-b1e4b9db4477	Yeze	{Fantasy,"Science Fiction",Mystery,Adventure,Horror,Thriller,Romance,"Historical Fiction",Musical,Drama,Comedy,Dystopian,Superhero,Western,Biographical,Cyberpunk}	e54623221c7e	0	\N	2025-11-22 12:31:41.163312	2025-11-22 12:31:41.163312
41984418-c1af-4c11-a3cb-b70b1ba0abdc	e22ea3ae-2198-4888-b08a-3ed6b81e4560	Jason Anudu	{Fantasy,"Science Fiction",Thriller,Horror,Adventure,Mystery,"Historical Fiction",Drama,Superhero,Dystopian,Western,Cyberpunk}	233ffa243bf2	0	\N	2025-11-22 18:36:41.461436	2025-11-22 18:36:41.461436
0173ff91-af2c-4359-9318-56411d551cd3	4a835203-e4cc-4f68-bc55-d61c1595a7a8	Silver	{Romance}	711dac2c0ce0	0	\N	2025-11-22 20:52:00.336891	2025-11-22 20:52:00.336891
dfdb8345-fa66-4745-ae3c-6f0e60bdfad4	ee9b56b1-cae8-4fb1-bcdc-a97510e0b6f0	Eben Adah	{}	3cc707ba13ef	0	\N	2026-01-28 19:36:26.307607	2026-01-28 19:36:26.307607
\.


--
-- Data for Name: seller_withdrawals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.seller_withdrawals (id, seller_id, amount, status, rejection_reason, approved_at, processed_at, metadata, created_at, updated_at) FROM stdin;
45e35906-c00e-4eaa-a9e5-cbd3973f9c88	cccccccc-cccc-cccc-cccc-cccccccccccc	10.00	pending	\N	\N	\N	\N	2026-01-10 08:25:59.797584	2026-01-10 08:25:59.797584
661713a9-db97-417e-8583-f007e06d7ffb	cccccccc-cccc-cccc-cccc-cccccccccccc	10.00	pending	\N	\N	\N	\N	2026-01-10 08:28:53.689381	2026-01-10 08:28:53.689381
1380abaa-19e1-4412-930a-d198d27afcbc	cccccccc-cccc-cccc-cccc-cccccccccccc	10.00	pending	\N	\N	\N	\N	2026-01-10 18:47:28.77267	2026-01-10 18:47:28.77267
bcf27f76-1472-4f15-9791-3c43a3cb6a51	cccccccc-cccc-cccc-cccc-cccccccccccc	10.00	pending	\N	\N	\N	\N	2026-01-10 18:53:10.45351	2026-01-10 18:53:10.45351
0b17acd6-406a-4007-8130-07604e208c39	cccccccc-cccc-cccc-cccc-cccccccccccc	10.00	pending	\N	\N	\N	\N	2026-01-10 18:53:52.702476	2026-01-10 18:53:52.702476
\.


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_profiles (id, auth_user_id, first_name, last_name, display_name, bio, avatar_url, date_of_birth, country, timezone, language, preferences, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_transactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_transactions (id, reader_id, transaction_type, status, nwt_amount, usd_amount, description, spend_category, content_id, creator_id, helio_payment_id, helio_webhook_id, blockchain_tx_hash, metadata, failure_reason, created_at, updated_at) FROM stdin;
2db7c4fb-3c48-44af-a571-a9bea1b7cc63	f9768ec1-279c-4038-a426-f3f960099759	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dc1d5041caed74ecc2f142	\N	\N	\N	\N	2025-09-30 18:11:28.789912	2025-09-30 18:11:28.789912
da740efe-0a87-4831-a31f-ea3f45e12939	f9768ec1-279c-4038-a426-f3f960099759	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dc1ecc513e0927c8d6107b	\N	\N	\N	\N	2025-09-30 18:17:48.990495	2025-09-30 18:17:48.990495
e2beeb0a-e0b1-4147-bf8c-bb207fd8c950	d72bb5b0-e689-4084-96ce-4d3535e3ec42	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dc44c5b75b14c25bac86f4	\N	\N	\N	\N	2025-09-30 20:59:49.342311	2025-09-30 20:59:49.342311
2fcdb591-fd45-443d-a211-24d542d9898c	d72bb5b0-e689-4084-96ce-4d3535e3ec42	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dc46462d22cb97bd83a9d4	\N	\N	\N	\N	2025-09-30 21:06:14.670736	2025-09-30 21:06:14.670736
2781e5e6-35ce-40c2-9770-cd89beb2d9c0	d72bb5b0-e689-4084-96ce-4d3535e3ec42	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dc478f004ab3a3079095d8	\N	\N	\N	\N	2025-09-30 21:11:43.280856	2025-09-30 21:11:43.280856
10926f6c-6487-4148-b97d-5da964c8fcce	4a800a4e-cadb-4437-b9a4-6b4b13711339	purchase	pending	1000.000000	10.00	Purchase 1000 NWT for $10 via Helio	\N	\N	\N	68dc48f46c26c58afed403cb	\N	\N	\N	\N	2025-09-30 21:17:40.795783	2025-09-30 21:17:40.795783
ebbc3644-ff32-4aea-840e-531b79266dfb	f9768ec1-279c-4038-a426-f3f960099759	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dc626e22c2a26165837345	\N	\N	\N	\N	2025-09-30 23:06:22.456489	2025-09-30 23:06:22.456489
0d5de5c5-65cd-4204-a172-0f7248cb600c	f9768ec1-279c-4038-a426-f3f960099759	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dc637f694996dbf953dc7d	\N	\N	\N	\N	2025-09-30 23:10:55.670628	2025-09-30 23:10:55.670628
f1cffe9e-11ef-4b61-a4e7-7993a41ca44d	f9768ec1-279c-4038-a426-f3f960099759	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dc65ad6c26c58afed4583c	\N	\N	\N	\N	2025-09-30 23:20:13.173056	2025-09-30 23:20:13.173056
b1b730d1-5db4-45de-bef4-1cf33456bd06	f9768ec1-279c-4038-a426-f3f960099759	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dd1a498056db71bbf1c895	\N	\N	\N	\N	2025-10-01 12:10:49.460431	2025-10-01 12:10:49.460431
f8918572-3bd6-4178-9c33-07609f4b2dde	4a800a4e-cadb-4437-b9a4-6b4b13711339	purchase	pending	2000.000000	20.00	Purchase 2000 NWT for $20 via Helio	\N	\N	\N	68dd1c1fed6998fd22b8704e	\N	\N	\N	\N	2025-10-01 12:18:39.384549	2025-10-01 12:18:39.384549
2037c503-636d-4e21-9812-ba665423c58f	4a800a4e-cadb-4437-b9a4-6b4b13711339	purchase	pending	300.000000	3.00	Purchase 300 NWT for $3 via Helio	\N	\N	\N	68dd2328aad0803220cb5cdb	\N	\N	\N	\N	2025-10-01 12:48:40.204293	2025-10-01 12:48:40.204293
9c73de63-f496-4a12-8b7a-36640838854e	d72bb5b0-e689-4084-96ce-4d3535e3ec42	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dd2492aad0803220cb6138	\N	\N	\N	\N	2025-10-01 12:54:42.967293	2025-10-01 12:54:42.967293
acfbaf34-c084-474d-9746-73efde25dfba	d72bb5b0-e689-4084-96ce-4d3535e3ec42	purchase	pending	100.000000	1.00	Purchase 100 NWT for $1 via Helio	\N	\N	\N	68dd26238056db71bbf1eeab	\N	\N	\N	\N	2025-10-01 13:01:23.469677	2025-10-01 13:01:23.469677
166c8c96-32db-4ed4-b851-21a786810f59	d72bb5b0-e689-4084-96ce-4d3535e3ec42	purchase	pending	303.000000	3.03	Purchase 303 NWT for $3.03 via Helio	\N	\N	\N	68dd28906d2fbf37351ceb58	\N	\N	\N	\N	2025-10-01 13:11:44.48837	2025-10-01 13:11:44.48837
214a6c3d-0eca-42be-8f13-2a61a8184cb5	d72bb5b0-e689-4084-96ce-4d3535e3ec42	purchase	pending	10.000000	1.00	Purchase 10 NWT for $1 via Helio	\N	\N	\N	68dd2dfbed6998fd22b8b1fe	\N	\N	\N	\N	2025-10-01 13:34:51.806844	2025-10-01 13:34:51.806844
38044314-59ca-4024-87c2-3f5130f7ac6b	f9768ec1-279c-4038-a426-f3f960099759	purchase	pending	10.000000	1.00	Purchase 10 NWT for $1 via Helio	\N	\N	\N	68dff0c27e32f03466f23be6	\N	\N	\N	\N	2025-10-03 15:50:26.260335	2025-10-03 15:50:26.260335
e58c8864-944e-4fd1-a7bc-284b35ed155a	79a8efb7-e8ea-4eb9-99b1-0b2cd288df04	purchase	pending	100.000000	10.00	Purchase 100 NWT for $10 via Helio	\N	\N	\N	68ead7e7b06dd8ecc1f51da0	\N	\N	\N	\N	2025-10-11 22:19:19.684134	2025-10-11 22:19:19.684134
\.


--
-- Data for Name: user_wallets; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_wallets (id, user_profile_id, nwt_balance, nwt_locked_balance, primary_wallet_address, kyc_status, kyc_level, spending_limit_daily, spending_limit_monthly, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: wallet_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet_addresses (id, user_wallet_id, blockchain, address, is_verified, is_primary, label, added_at) FROM stdin;
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: postgres
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 2, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: postgres
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: _drizzle_migrations _drizzle_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._drizzle_migrations
    ADD CONSTRAINT _drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: auth_sessions auth_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_pkey PRIMARY KEY (id);


--
-- Name: auth_sessions auth_sessions_refresh_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_refresh_token_unique UNIQUE (refresh_token);


--
-- Name: auth_sessions auth_sessions_session_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_session_token_unique UNIQUE (session_token);


--
-- Name: auth_users auth_users_email_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_email_unique UNIQUE (email);


--
-- Name: auth_users auth_users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_pkey PRIMARY KEY (id);


--
-- Name: auth_users auth_users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_users
    ADD CONSTRAINT auth_users_username_unique UNIQUE (username);


--
-- Name: chapter_comments chapter_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_comments
    ADD CONSTRAINT chapter_comments_pkey PRIMARY KEY (id);


--
-- Name: chapter_likes chapter_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_likes
    ADD CONSTRAINT chapter_likes_pkey PRIMARY KEY (id);


--
-- Name: chapter_views chapter_views_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_views
    ADD CONSTRAINT chapter_views_pkey PRIMARY KEY (id);


--
-- Name: chapters chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_pkey PRIMARY KEY (id);


--
-- Name: chapters chapters_unique_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_unique_code_unique UNIQUE (unique_code);


--
-- Name: comic_subscribers comic_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic_subscribers
    ADD CONSTRAINT comic_subscribers_pkey PRIMARY KEY (id);


--
-- Name: comics comics_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comics
    ADD CONSTRAINT comics_pkey PRIMARY KEY (id);


--
-- Name: comics comics_slug_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comics
    ADD CONSTRAINT comics_slug_unique UNIQUE (slug);


--
-- Name: creator_bank_details creator_bank_details_creator_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_bank_details
    ADD CONSTRAINT creator_bank_details_creator_id_unique UNIQUE (creator_id);


--
-- Name: creator_bank_details creator_bank_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_bank_details
    ADD CONSTRAINT creator_bank_details_pkey PRIMARY KEY (id);


--
-- Name: creator_profile creator_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_profile
    ADD CONSTRAINT creator_profile_pkey PRIMARY KEY (id);


--
-- Name: creator_profile creator_profile_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_profile
    ADD CONSTRAINT creator_profile_user_id_unique UNIQUE (user_id);


--
-- Name: creator_transactions creator_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_transactions
    ADD CONSTRAINT creator_transactions_pkey PRIMARY KEY (id);


--
-- Name: device_tokens device_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT device_tokens_pkey PRIMARY KEY (id);


--
-- Name: library library_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.library
    ADD CONSTRAINT library_pkey PRIMARY KEY (id);


--
-- Name: loyalty_points loyalty_points_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_pkey PRIMARY KEY (id);


--
-- Name: marketplace_config marketplace_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_config
    ADD CONSTRAINT marketplace_config_pkey PRIMARY KEY (id);


--
-- Name: marketplace_escrow marketplace_escrow_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marketplace_escrow
    ADD CONSTRAINT marketplace_escrow_pkey PRIMARY KEY (id);


--
-- Name: nft_listings nft_listings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_listings
    ADD CONSTRAINT nft_listings_pkey PRIMARY KEY (id);


--
-- Name: nft_marketplace_transfers nft_marketplace_transfers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_marketplace_transfers
    ADD CONSTRAINT nft_marketplace_transfers_pkey PRIMARY KEY (id);


--
-- Name: nft_order_transactions nft_order_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_order_transactions
    ADD CONSTRAINT nft_order_transactions_pkey PRIMARY KEY (id);


--
-- Name: nft_orders nft_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_orders
    ADD CONSTRAINT nft_orders_pkey PRIMARY KEY (id);


--
-- Name: nft_transactions nft_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_transactions
    ADD CONSTRAINT nft_transactions_pkey PRIMARY KEY (id);


--
-- Name: nft_transfer_history nft_transfer_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nft_transfer_history
    ADD CONSTRAINT nft_transfer_history_pkey PRIMARY KEY (id);


--
-- Name: nfts nfts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nfts
    ADD CONSTRAINT nfts_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: nwt_transactions nwt_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nwt_transactions
    ADD CONSTRAINT nwt_transactions_pkey PRIMARY KEY (id);


--
-- Name: paid_Chapters paid_Chapters_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."paid_Chapters"
    ADD CONSTRAINT "paid_Chapters_pkey" PRIMARY KEY (id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: password_resets password_resets_token_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_token_unique UNIQUE (token);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: reader_profile reader_profile_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reader_profile
    ADD CONSTRAINT reader_profile_pkey PRIMARY KEY (id);


--
-- Name: reader_profile reader_profile_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reader_profile
    ADD CONSTRAINT reader_profile_user_id_unique UNIQUE (user_id);


--
-- Name: reader_profile reader_profile_wallet_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reader_profile
    ADD CONSTRAINT reader_profile_wallet_id_unique UNIQUE (wallet_id);


--
-- Name: seller_withdrawals seller_withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.seller_withdrawals
    ADD CONSTRAINT seller_withdrawals_pkey PRIMARY KEY (id);


--
-- Name: user_profiles user_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);


--
-- Name: user_transactions user_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_transactions
    ADD CONSTRAINT user_transactions_pkey PRIMARY KEY (id);


--
-- Name: user_wallets user_wallets_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_wallets
    ADD CONSTRAINT user_wallets_pkey PRIMARY KEY (id);


--
-- Name: user_wallets user_wallets_user_profile_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_wallets
    ADD CONSTRAINT user_wallets_user_profile_id_unique UNIQUE (user_profile_id);


--
-- Name: wallet_addresses wallet_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_addresses
    ADD CONSTRAINT wallet_addresses_pkey PRIMARY KEY (id);


--
-- Name: auth_sessions auth_sessions_user_id_auth_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_sessions
    ADD CONSTRAINT auth_sessions_user_id_auth_users_id_fk FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE;


--
-- Name: chapter_comments chapter_comments_chapter_id_chapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_comments
    ADD CONSTRAINT chapter_comments_chapter_id_chapters_id_fk FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: chapter_comments chapter_comments_reader_id_reader_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_comments
    ADD CONSTRAINT chapter_comments_reader_id_reader_profile_id_fk FOREIGN KEY (reader_id) REFERENCES public.reader_profile(id) ON DELETE CASCADE;


--
-- Name: chapter_likes chapter_likes_chapter_id_chapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_likes
    ADD CONSTRAINT chapter_likes_chapter_id_chapters_id_fk FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: chapter_likes chapter_likes_reader_id_reader_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_likes
    ADD CONSTRAINT chapter_likes_reader_id_reader_profile_id_fk FOREIGN KEY (reader_id) REFERENCES public.reader_profile(id) ON DELETE CASCADE;


--
-- Name: chapter_views chapter_views_chapter_id_chapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_views
    ADD CONSTRAINT chapter_views_chapter_id_chapters_id_fk FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: chapter_views chapter_views_reader_id_reader_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapter_views
    ADD CONSTRAINT chapter_views_reader_id_reader_profile_id_fk FOREIGN KEY (reader_id) REFERENCES public.reader_profile(id) ON DELETE CASCADE;


--
-- Name: chapters chapters_comic_id_comics_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chapters
    ADD CONSTRAINT chapters_comic_id_comics_id_fk FOREIGN KEY (comic_id) REFERENCES public.comics(id) ON DELETE CASCADE;


--
-- Name: comic_subscribers comic_subscribers_comic_id_comics_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic_subscribers
    ADD CONSTRAINT comic_subscribers_comic_id_comics_id_fk FOREIGN KEY (comic_id) REFERENCES public.comics(id) ON DELETE CASCADE;


--
-- Name: comic_subscribers comic_subscribers_reader_id_reader_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comic_subscribers
    ADD CONSTRAINT comic_subscribers_reader_id_reader_profile_id_fk FOREIGN KEY (reader_id) REFERENCES public.reader_profile(id) ON DELETE CASCADE;


--
-- Name: comics comics_creator_id_creator_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.comics
    ADD CONSTRAINT comics_creator_id_creator_profile_id_fk FOREIGN KEY (creator_id) REFERENCES public.creator_profile(id) ON DELETE CASCADE;


--
-- Name: creator_bank_details creator_bank_details_creator_id_creator_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_bank_details
    ADD CONSTRAINT creator_bank_details_creator_id_creator_profile_id_fk FOREIGN KEY (creator_id) REFERENCES public.creator_profile(id) ON DELETE CASCADE;


--
-- Name: creator_profile creator_profile_user_id_auth_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_profile
    ADD CONSTRAINT creator_profile_user_id_auth_users_id_fk FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE;


--
-- Name: creator_transactions creator_transactions_creator_id_creator_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_transactions
    ADD CONSTRAINT creator_transactions_creator_id_creator_profile_id_fk FOREIGN KEY (creator_id) REFERENCES public.creator_profile(id) ON DELETE CASCADE;


--
-- Name: creator_transactions creator_transactions_source_user_transaction_id_user_transactio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.creator_transactions
    ADD CONSTRAINT creator_transactions_source_user_transaction_id_user_transactio FOREIGN KEY (source_user_transaction_id) REFERENCES public.user_transactions(id);


--
-- Name: device_tokens device_tokens_reader_id_reader_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.device_tokens
    ADD CONSTRAINT device_tokens_reader_id_reader_profile_id_fk FOREIGN KEY (reader_id) REFERENCES public.reader_profile(id) ON DELETE CASCADE;


--
-- Name: library library_comic_id_comics_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.library
    ADD CONSTRAINT library_comic_id_comics_id_fk FOREIGN KEY (comic_id) REFERENCES public.comics(id) ON DELETE CASCADE;


--
-- Name: library library_reader_id_reader_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.library
    ADD CONSTRAINT library_reader_id_reader_profile_id_fk FOREIGN KEY (reader_id) REFERENCES public.reader_profile(id) ON DELETE CASCADE;


--
-- Name: loyalty_points loyalty_points_user_id_auth_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_user_id_auth_users_id_fk FOREIGN KEY (user_id) REFERENCES public.auth_users(id);


--
-- Name: notifications notifications_chapter_id_chapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_chapter_id_chapters_id_fk FOREIGN KEY (chapter_id) REFERENCES public.chapters(id);


--
-- Name: notifications notifications_comic_id_comics_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_comic_id_comics_id_fk FOREIGN KEY (comic_id) REFERENCES public.comics(id);


--
-- Name: notifications notifications_reader_id_reader_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_reader_id_reader_profile_id_fk FOREIGN KEY (reader_id) REFERENCES public.reader_profile(id) ON DELETE CASCADE;


--
-- Name: nwt_transactions nwt_transactions_user_wallet_id_user_wallets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nwt_transactions
    ADD CONSTRAINT nwt_transactions_user_wallet_id_user_wallets_id_fk FOREIGN KEY (user_wallet_id) REFERENCES public.user_wallets(id) ON DELETE CASCADE;


--
-- Name: paid_Chapters paid_Chapters_chapter_id_chapters_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."paid_Chapters"
    ADD CONSTRAINT "paid_Chapters_chapter_id_chapters_id_fk" FOREIGN KEY (chapter_id) REFERENCES public.chapters(id) ON DELETE CASCADE;


--
-- Name: paid_Chapters paid_Chapters_reader_id_reader_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."paid_Chapters"
    ADD CONSTRAINT "paid_Chapters_reader_id_reader_profile_id_fk" FOREIGN KEY (reader_id) REFERENCES public.reader_profile(id) ON DELETE CASCADE;


--
-- Name: password_resets password_resets_user_id_auth_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_user_id_auth_users_id_fk FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE;


--
-- Name: payments payments_user_wallet_id_user_wallets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_user_wallet_id_user_wallets_id_fk FOREIGN KEY (user_wallet_id) REFERENCES public.user_wallets(id) ON DELETE CASCADE;


--
-- Name: reader_profile reader_profile_user_id_auth_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reader_profile
    ADD CONSTRAINT reader_profile_user_id_auth_users_id_fk FOREIGN KEY (user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE;


--
-- Name: user_profiles user_profiles_auth_user_id_auth_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_profiles
    ADD CONSTRAINT user_profiles_auth_user_id_auth_users_id_fk FOREIGN KEY (auth_user_id) REFERENCES public.auth_users(id) ON DELETE CASCADE;


--
-- Name: user_transactions user_transactions_reader_id_reader_profile_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_transactions
    ADD CONSTRAINT user_transactions_reader_id_reader_profile_id_fk FOREIGN KEY (reader_id) REFERENCES public.reader_profile(id) ON DELETE CASCADE;


--
-- Name: user_wallets user_wallets_user_profile_id_user_profiles_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_wallets
    ADD CONSTRAINT user_wallets_user_profile_id_user_profiles_id_fk FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;


--
-- Name: wallet_addresses wallet_addresses_user_wallet_id_user_wallets_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_addresses
    ADD CONSTRAINT wallet_addresses_user_wallet_id_user_wallets_id_fk FOREIGN KEY (user_wallet_id) REFERENCES public.user_wallets(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict deDpwpdlvZfTzT7Ufzl5j23h3mefxKSmCJWv4gg6kfoTlXkXktrVwUdaWtp6Os4

