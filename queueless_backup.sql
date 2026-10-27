--
-- PostgreSQL database dump
--

\restrict f02toMc6hzpPkmVe9GSHhom7le7xwS1SF3kWubSrHDVfFM43MuRuaW27ANsZJud

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    quantity integer NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    cart_id uuid NOT NULL,
    product_id uuid NOT NULL
);


--
-- Name: carts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.carts (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    customer_id uuid NOT NULL
);


--
-- Name: complaint; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaint (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    description character varying(2000) NOT NULL,
    evidence_count integer NOT NULL,
    review_note character varying(2000),
    reviewed_at timestamp(6) without time zone,
    status character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    complainant_id uuid NOT NULL,
    order_id uuid NOT NULL,
    reported_shop_id uuid,
    reported_user_id uuid NOT NULL,
    reviewed_by_id uuid,
    CONSTRAINT complaint_status_check CHECK (((status)::text = ANY ((ARRAY['SUBMITTED'::character varying, 'UNDER_REVIEW'::character varying, 'VALID'::character varying, 'INVALID'::character varying, 'DISMISSED'::character varying])::text[]))),
    CONSTRAINT complaint_type_check CHECK (((type)::text = ANY ((ARRAY['SHOP_DELAY'::character varying, 'SHOP_WRONG_ORDER'::character varying, 'SHOP_ORDER_REFUSAL'::character varying, 'SHOP_OTHER'::character varying, 'CUSTOMER_NO_SHOW'::character varying, 'CUSTOMER_ABUSE'::character varying, 'CUSTOMER_FRAUD'::character varying, 'CUSTOMER_OTHER'::character varying])::text[])))
);


--
-- Name: complaint_evidence; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.complaint_evidence (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    description character varying(1000),
    file_url character varying(1000) NOT NULL,
    type character varying(255) NOT NULL,
    complaint_id uuid NOT NULL,
    CONSTRAINT complaint_evidence_type_check CHECK (((type)::text = ANY ((ARRAY['IMAGE'::character varying, 'VIDEO'::character varying, 'DOCUMENT'::character varying, 'TEXT'::character varying, 'OTHER'::character varying])::text[])))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    message character varying(1000) NOT NULL,
    read boolean NOT NULL,
    read_at timestamp(6) without time zone,
    related_order_id uuid,
    related_shop_id uuid,
    title character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    recipient_id uuid NOT NULL,
    CONSTRAINT notifications_type_check CHECK (((type)::text = ANY ((ARRAY['ORDER_PLACED'::character varying, 'ORDER_CONFIRMED'::character varying, 'ORDER_REJECTED'::character varying, 'ORDER_CANCELLED'::character varying, 'PICKUP_SLOT_REQUESTED'::character varying, 'PICKUP_SLOT_ACCEPTED'::character varying, 'PICKUP_SLOT_REJECTED'::character varying, 'PICKUP_SLOT_COUNTER_PROPOSED'::character varying, 'PICKUP_SLOT_CUSTOMER_ACCEPTED'::character varying, 'PICKUP_SLOT_CUSTOMER_REJECTED'::character varying, 'ORDER_PREPARING'::character varying, 'ORDER_READY_FOR_PICKUP'::character varying, 'ORDER_COLLECTED'::character varying, 'COMPLAINT_SUBMITTED'::character varying, 'COMPLAINT_REVIEWED'::character varying, 'ACCOUNT_SUSPENDED'::character varying, 'ACCOUNT_REINSTATED'::character varying, 'SHOP_SUSPENDED'::character varying, 'SHOP_REINSTATED'::character varying])::text[])))
);


--
-- Name: order_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.order_items (
    id uuid NOT NULL,
    product_name_snapshot character varying(255) NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    unit_price_snapshot numeric(10,2) NOT NULL,
    order_id uuid NOT NULL,
    product_id uuid NOT NULL
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    status character varying(255) NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    customer_id uuid NOT NULL,
    shop_id uuid NOT NULL,
    hidden_for_customer boolean DEFAULT false NOT NULL,
    CONSTRAINT orders_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'CONFIRMED'::character varying, 'REJECTED'::character varying, 'PREPARING'::character varying, 'READY_FOR_PICKUP'::character varying, 'COLLECTED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: pickup_otp; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pickup_otp (
    id uuid NOT NULL,
    consumed boolean NOT NULL,
    consumed_at timestamp(6) without time zone,
    created_at timestamp(6) with time zone NOT NULL,
    encrypted_otp character varying(512) NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    failed_attempts integer NOT NULL,
    otp_hash character varying(255) NOT NULL,
    salt character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    verified boolean NOT NULL,
    verified_at timestamp(6) without time zone,
    order_id uuid NOT NULL
);


--
-- Name: pickup_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pickup_slots (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    pickup_date date NOT NULL,
    proposed_date date,
    proposed_end_time time(0) without time zone,
    proposed_start_time time(0) without time zone,
    requested_end_time time(0) without time zone NOT NULL,
    requested_start_time time(0) without time zone NOT NULL,
    status character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    order_id uuid NOT NULL,
    CONSTRAINT pickup_slots_status_check CHECK (((status)::text = ANY ((ARRAY['REQUESTED'::character varying, 'ACCEPTED'::character varying, 'COUNTER_PROPOSED'::character varying, 'CUSTOMER_ACCEPTED'::character varying, 'CUSTOMER_REJECTED'::character varying, 'SHOP_REJECTED'::character varying, 'EXPIRED'::character varying, 'CANCELLED'::character varying])::text[])))
);


--
-- Name: pickup_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pickup_token (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    token_hash character varying(255) NOT NULL,
    used boolean NOT NULL,
    used_at timestamp(6) without time zone,
    order_id uuid NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    available boolean NOT NULL,
    category character varying(255) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    description text,
    image_url character varying(255),
    name character varying(255) NOT NULL,
    price numeric(10,2) NOT NULL,
    stock_quantity integer NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    shop_id uuid NOT NULL,
    CONSTRAINT products_category_check CHECK (((category)::text = ANY ((ARRAY['GROCERY'::character varying, 'FRUITS_VEGETABLES'::character varying, 'DAIRY'::character varying, 'BEVERAGES'::character varying, 'SNACKS'::character varying, 'MEDICINE'::character varying, 'PERSONAL_CARE'::character varying, 'BAKERY'::character varying, 'RESTAURANT'::character varying, 'STATIONERY'::character varying, 'MEAT'::character varying, 'OTHER'::character varying])::text[])))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id uuid NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    expiry_date timestamp(6) with time zone NOT NULL,
    revoked boolean NOT NULL,
    token character varying(255) NOT NULL,
    user_id uuid NOT NULL
);


--
-- Name: shops; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.shops (
    id uuid NOT NULL,
    address character varying(255) NOT NULL,
    category character varying(255) NOT NULL,
    city character varying(255) NOT NULL,
    closing_time time(0) without time zone NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    description text,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    opening_time time(0) without time zone NOT NULL,
    phone character varying(255) NOT NULL,
    shop_name character varying(255) NOT NULL,
    status character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    owner_id uuid NOT NULL,
    valid_complaint_count integer NOT NULL,
    image_url text,
    CONSTRAINT shops_category_check CHECK (((category)::text = ANY ((ARRAY['GROCERY'::character varying, 'PHARMACY'::character varying, 'RESTAURANT'::character varying, 'BAKERY'::character varying, 'STATIONERY'::character varying, 'MEAT_SHOP'::character varying, 'OTHER'::character varying])::text[]))),
    CONSTRAINT shops_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'ACTIVE'::character varying, 'INACTIVE'::character varying, 'SUSPENDED'::character varying])::text[])))
);


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.system_settings (
    setting_key character varying(64) NOT NULL,
    category character varying(64) NOT NULL,
    description character varying(256),
    updated_at timestamp(6) with time zone NOT NULL,
    updated_by character varying(128),
    setting_value character varying(512) NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    account_status character varying(255) NOT NULL,
    created_at timestamp(6) with time zone NOT NULL,
    email character varying(255) NOT NULL,
    full_name character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    role character varying(255) NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    valid_complaint_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT users_account_status_check CHECK (((account_status)::text = ANY ((ARRAY['ACTIVE'::character varying, 'SUSPENDED'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['CUSTOMER'::character varying, 'SHOP_OWNER'::character varying, 'ADMIN'::character varying])::text[])))
);


--
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.cart_items (id, created_at, quantity, updated_at, cart_id, product_id) FROM stdin;
\.


--
-- Data for Name: carts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.carts (id, created_at, updated_at, customer_id) FROM stdin;
29036734-881d-4d5e-8642-2156cf39d662	2026-09-15 22:38:08.903294+05:30	2026-09-15 22:38:08.903294+05:30	852eeb10-0003-424a-957d-e1aab2c88b5a
\.


--
-- Data for Name: complaint; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complaint (id, created_at, description, evidence_count, review_note, reviewed_at, status, type, updated_at, complainant_id, order_id, reported_shop_id, reported_user_id, reviewed_by_id) FROM stdin;
\.


--
-- Data for Name: complaint_evidence; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.complaint_evidence (id, created_at, description, file_url, type, complaint_id) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, created_at, message, read, read_at, related_order_id, related_shop_id, title, type, recipient_id) FROM stdin;
7def669d-eac2-4305-83c8-1b8ad5a190d1	2026-09-15 23:30:34.352888+05:30	You have received a new order.	f	\N	f4748628-e685-4680-a0f0-cf2f3ae9a595	d9ba10c1-0302-41e5-81e3-4786640fe534	New Order	ORDER_PLACED	0d642d6d-39d1-4236-94fa-1b22dc3d3947
795615f7-134f-4493-823f-a807618b2c41	2026-09-15 23:30:34.478602+05:30	Customer requested a pickup slot.	f	\N	f4748628-e685-4680-a0f0-cf2f3ae9a595	d9ba10c1-0302-41e5-81e3-4786640fe534	Pickup Slot Requested	PICKUP_SLOT_REQUESTED	0d642d6d-39d1-4236-94fa-1b22dc3d3947
e9f98e32-e540-455d-861d-5daa30d4be0d	2026-09-15 23:31:16.569516+05:30	An order was cancelled by customer.	f	\N	f4748628-e685-4680-a0f0-cf2f3ae9a595	d9ba10c1-0302-41e5-81e3-4786640fe534	Order Cancelled	ORDER_CANCELLED	0d642d6d-39d1-4236-94fa-1b22dc3d3947
448d9141-4d73-4248-a6a1-9ae5dbdeaee6	2026-09-18 20:54:16.324521+05:30	You have received a new order.	f	\N	0544edac-83a0-4caa-beda-8ec4e9ad5a9c	6d077f57-c95f-455c-b87b-260f2a4ea317	New Order	ORDER_PLACED	fe57dc39-9a6b-4a91-8de4-e66f721b6684
125522f3-ad67-4a71-828e-0ef9b82f6d8e	2026-09-18 20:54:16.39801+05:30	Customer requested a pickup slot.	f	\N	0544edac-83a0-4caa-beda-8ec4e9ad5a9c	6d077f57-c95f-455c-b87b-260f2a4ea317	Pickup Slot Requested	PICKUP_SLOT_REQUESTED	fe57dc39-9a6b-4a91-8de4-e66f721b6684
cca00acf-b273-42c2-85b4-4a401ec06764	2026-09-18 20:55:10.990034+05:30	Your order has been confirmed.	t	2026-09-19 21:41:29.283225	0544edac-83a0-4caa-beda-8ec4e9ad5a9c	6d077f57-c95f-455c-b87b-260f2a4ea317	Order Confirmed	ORDER_CONFIRMED	852eeb10-0003-424a-957d-e1aab2c88b5a
ef781352-8d4a-484c-8c31-a800aae8137d	2026-09-18 20:55:14.085819+05:30	Your order is now being prepared.	t	2026-09-19 21:41:30.114503	0544edac-83a0-4caa-beda-8ec4e9ad5a9c	6d077f57-c95f-455c-b87b-260f2a4ea317	Order Preparation Started	ORDER_PREPARING	852eeb10-0003-424a-957d-e1aab2c88b5a
c6e54f12-60a1-44b4-90e9-3a40c2db246b	2026-09-18 20:57:18.688164+05:30	Shop accepted your requested pickup slot.	t	2026-09-19 21:41:30.766443	0544edac-83a0-4caa-beda-8ec4e9ad5a9c	6d077f57-c95f-455c-b87b-260f2a4ea317	Pickup Slot Accepted	PICKUP_SLOT_ACCEPTED	852eeb10-0003-424a-957d-e1aab2c88b5a
dcdbebb7-87ff-46c3-b088-8e2f3af39b4c	2026-09-18 20:57:27.940357+05:30	Your order is ready for pickup.	t	2026-09-19 21:41:31.792531	0544edac-83a0-4caa-beda-8ec4e9ad5a9c	6d077f57-c95f-455c-b87b-260f2a4ea317	Order Ready for Pickup	ORDER_READY_FOR_PICKUP	852eeb10-0003-424a-957d-e1aab2c88b5a
6df85012-b0d1-4917-8e89-9d964ac76395	2026-09-19 21:40:38.946897+05:30	Your order has been collected.	t	2026-09-19 21:41:32.639284	0544edac-83a0-4caa-beda-8ec4e9ad5a9c	6d077f57-c95f-455c-b87b-260f2a4ea317	Order Collected	ORDER_COLLECTED	852eeb10-0003-424a-957d-e1aab2c88b5a
26b10ffd-2b7d-4f3c-809c-9a3d4b8ab748	2026-09-19 23:20:11.914476+05:30	You have received a new order.	f	\N	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8	6d077f57-c95f-455c-b87b-260f2a4ea317	New Order	ORDER_PLACED	fe57dc39-9a6b-4a91-8de4-e66f721b6684
71643604-e39e-4edc-b050-1b6ef77396b4	2026-09-19 23:20:11.974581+05:30	Customer requested a pickup slot.	f	\N	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8	6d077f57-c95f-455c-b87b-260f2a4ea317	Pickup Slot Requested	PICKUP_SLOT_REQUESTED	fe57dc39-9a6b-4a91-8de4-e66f721b6684
e68856b3-8204-41d9-a555-c8621b4c518c	2026-09-20 19:14:57.161355+05:30	Customer accepted your counter-proposal.	f	\N	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8	6d077f57-c95f-455c-b87b-260f2a4ea317	Counter-Proposal Accepted	PICKUP_SLOT_CUSTOMER_ACCEPTED	fe57dc39-9a6b-4a91-8de4-e66f721b6684
d890c0ab-6818-469b-9324-a473889b9e5c	2026-09-19 23:20:54.791555+05:30	Your order has been confirmed.	t	2026-09-20 19:46:16.256779	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8	6d077f57-c95f-455c-b87b-260f2a4ea317	Order Confirmed	ORDER_CONFIRMED	852eeb10-0003-424a-957d-e1aab2c88b5a
019af455-b208-48a9-bcd4-209f6f1cb2a1	2026-09-19 23:20:56.042493+05:30	Your order is now being prepared.	t	2026-09-20 19:46:16.256779	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8	6d077f57-c95f-455c-b87b-260f2a4ea317	Order Preparation Started	ORDER_PREPARING	852eeb10-0003-424a-957d-e1aab2c88b5a
9ee7f518-7401-4061-bf05-e43ce593d88d	2026-09-19 23:22:43.39976+05:30	Shop proposed a different pickup slot.	t	2026-09-20 19:46:16.256779	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8	6d077f57-c95f-455c-b87b-260f2a4ea317	Pickup Slot Counter-Proposed	PICKUP_SLOT_COUNTER_PROPOSED	852eeb10-0003-424a-957d-e1aab2c88b5a
2af5c937-22e2-4fa3-a3d1-798b8dafa916	2026-09-20 19:15:13.844373+05:30	Your order is ready for pickup.	t	2026-09-20 19:46:16.256779	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8	6d077f57-c95f-455c-b87b-260f2a4ea317	Order Ready for Pickup	ORDER_READY_FOR_PICKUP	852eeb10-0003-424a-957d-e1aab2c88b5a
768ce1b8-0eef-40fd-ae82-5e940ff4ba9f	2026-09-20 19:32:57.194458+05:30	Your order has been collected.	t	2026-09-20 19:46:16.256779	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8	6d077f57-c95f-455c-b87b-260f2a4ea317	Order Collected	ORDER_COLLECTED	852eeb10-0003-424a-957d-e1aab2c88b5a
582869f0-8e1e-4e42-93cb-f79243911912	2026-09-20 22:29:16.339755+05:30	You have received a new order.	f	\N	6112ac4a-3535-48af-8cc8-17a6e6bc565b	6d077f57-c95f-455c-b87b-260f2a4ea317	New Order	ORDER_PLACED	fe57dc39-9a6b-4a91-8de4-e66f721b6684
cc406ffb-d541-43f8-b701-7f9d212ba064	2026-09-20 22:29:16.459038+05:30	Customer requested a pickup slot.	f	\N	6112ac4a-3535-48af-8cc8-17a6e6bc565b	6d077f57-c95f-455c-b87b-260f2a4ea317	Pickup Slot Requested	PICKUP_SLOT_REQUESTED	fe57dc39-9a6b-4a91-8de4-e66f721b6684
\.


--
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.order_items (id, product_name_snapshot, quantity, subtotal, unit_price_snapshot, order_id, product_id) FROM stdin;
487b57bb-9a09-427e-85e3-c4d3199fbfd0	Masala Dosa	1	50.00	50.00	f4748628-e685-4680-a0f0-cf2f3ae9a595	0f63d016-d46c-435f-bef6-444a49366e58
87da9d01-2303-423a-8e92-acc07321db43	demo	20	20000.00	1000.00	0544edac-83a0-4caa-beda-8ec4e9ad5a9c	5f535bee-011c-485b-aa8d-f361f886f86a
d76012cf-48de-47cc-abc9-84c8b76a6ba4	demo	1	1000.00	1000.00	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8	5f535bee-011c-485b-aa8d-f361f886f86a
fe508022-2ce2-4bf0-a5d5-2bad73dc9fdc	demo	1	1000.00	1000.00	6112ac4a-3535-48af-8cc8-17a6e6bc565b	5f535bee-011c-485b-aa8d-f361f886f86a
\.


--
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.orders (id, created_at, status, total_amount, updated_at, customer_id, shop_id, hidden_for_customer) FROM stdin;
f4748628-e685-4680-a0f0-cf2f3ae9a595	2026-09-15 23:30:34.345878+05:30	CANCELLED	50.00	2026-09-15 23:31:16.574593+05:30	852eeb10-0003-424a-957d-e1aab2c88b5a	d9ba10c1-0302-41e5-81e3-4786640fe534	f
0544edac-83a0-4caa-beda-8ec4e9ad5a9c	2026-09-18 20:54:16.317514+05:30	COLLECTED	20000.00	2026-09-19 21:40:38.951898+05:30	852eeb10-0003-424a-957d-e1aab2c88b5a	6d077f57-c95f-455c-b87b-260f2a4ea317	f
0ccdba75-a029-41b1-9bc2-09eeb17ef8a8	2026-09-19 23:20:11.90809+05:30	COLLECTED	1000.00	2026-09-20 19:32:57.199304+05:30	852eeb10-0003-424a-957d-e1aab2c88b5a	6d077f57-c95f-455c-b87b-260f2a4ea317	f
6112ac4a-3535-48af-8cc8-17a6e6bc565b	2026-09-20 22:29:16.332541+05:30	PENDING	1000.00	2026-09-20 22:29:16.332541+05:30	852eeb10-0003-424a-957d-e1aab2c88b5a	6d077f57-c95f-455c-b87b-260f2a4ea317	f
\.


--
-- Data for Name: pickup_otp; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pickup_otp (id, consumed, consumed_at, created_at, encrypted_otp, expires_at, failed_attempts, otp_hash, salt, updated_at, verified, verified_at, order_id) FROM stdin;
758eb8fb-efa1-4ff3-8ca1-595067171569	t	2026-09-19 21:40:38.942898	2026-09-19 21:40:01.519204+05:30	NpWaqvgTZcNGSLOG7/o0ajZiXphEZmYJxvllqwGRmtjy9Q==	2026-09-19 21:55:01.500207	0	019e999cd2a5964aef38dca4907cc4ec50ae8d6f89f43d96e50d99f9b2020c87	b01e1ae8b421023ed897e5b6033772c4	2026-09-19 21:40:38.951898+05:30	t	2026-09-19 21:40:24.738436	0544edac-83a0-4caa-beda-8ec4e9ad5a9c
eda33f56-347f-44b4-9d92-49c0059b06fb	t	2026-09-20 19:32:57.191459	2026-09-20 19:15:40.544748+05:30	T2EHno6QDI3guF3Dt4me+8d1b9sQBZkRZFkSOc0xnDu9BA==	2026-09-20 19:35:27.439968	0	6c5a9ea6065ffc1dc84b8a0800df863fe82ca95a645d5b2c8b423b48352f8b0f	5de893ca40b4f0320b6d60c1deb44cb7	2026-09-20 19:32:57.199304+05:30	t	2026-09-20 19:32:49.211745	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8
\.


--
-- Data for Name: pickup_slots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pickup_slots (id, created_at, pickup_date, proposed_date, proposed_end_time, proposed_start_time, requested_end_time, requested_start_time, status, updated_at, order_id) FROM stdin;
8e5bafd5-d09d-41ef-bae1-20f2167f7cca	2026-09-15 23:30:34.477576+05:30	2026-09-16	\N	\N	\N	08:00:00	07:30:00	REQUESTED	2026-09-15 23:30:34.477576+05:30	f4748628-e685-4680-a0f0-cf2f3ae9a595
232aebb5-4e6d-42c6-b84e-b8e3ce252450	2026-09-18 20:54:16.39801+05:30	2026-09-19	\N	\N	\N	09:30:00	09:00:00	ACCEPTED	2026-09-18 20:57:18.688164+05:30	0544edac-83a0-4caa-beda-8ec4e9ad5a9c
605c9fbf-9662-4c2a-be41-410269f59276	2026-09-19 23:20:11.974581+05:30	2026-09-20	2026-09-20	13:30:00	12:00:00	09:30:00	09:00:00	CUSTOMER_ACCEPTED	2026-09-20 19:14:57.161355+05:30	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8
224e152d-c9e1-48ac-bb45-d775692f8774	2026-09-20 22:29:16.458043+05:30	2026-09-21	\N	\N	\N	09:30:00	09:00:00	REQUESTED	2026-09-20 22:29:16.458043+05:30	6112ac4a-3535-48af-8cc8-17a6e6bc565b
\.


--
-- Data for Name: pickup_token; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.pickup_token (id, created_at, expires_at, token_hash, used, used_at, order_id) FROM stdin;
b64fdf8d-c814-4cf6-a95f-c101b462af2b	2026-09-18 20:57:41.564339+05:30	2026-09-19 22:10:08.609474	cb919516b2042b978e3fbb9bcee6c70e050f3728b70853bacd5855fc3f70913f	f	\N	0544edac-83a0-4caa-beda-8ec4e9ad5a9c
5aa998cb-a45c-463f-9f3e-cfb4735f2c43	2026-09-20 19:15:36.502251+05:30	2026-09-20 20:02:36.09704	7b1e9cc4f11e0b2a226287be53ba39b7ff43e8d9685a6cea0d2398e6ce0490f7	f	\N	0ccdba75-a029-41b1-9bc2-09eeb17ef8a8
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.products (id, available, category, created_at, description, image_url, name, price, stock_quantity, updated_at, shop_id) FROM stdin;
aeabb805-22d9-4eb1-9dbc-c589cf5c0971	t	RESTAURANT	2026-09-15 23:28:08.045107+05:30	Steamed fluffy rice-lentil cakes served with piping hot sambar and traditional chutney.	https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80	Idli	35.00	100	2026-09-15 23:28:08.045107+05:30	d9ba10c1-0302-41e5-81e3-4786640fe534
1b0e8a6c-a24e-4a6c-b621-8ed2e5dcb7af	t	RESTAURANT	2026-09-15 23:28:08.0501+05:30	Crispy deep-fried savory medu vada spiced with black pepper, curry leaves, and ginger.	https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80	Vada	30.00	100	2026-09-15 23:28:08.0501+05:30	d9ba10c1-0302-41e5-81e3-4786640fe534
742615c6-ed7f-473a-a285-68f2bda67ae4	t	SNACKS	2026-09-15 23:28:08.056157+05:30	Toasted bread with fresh cucumber, tomato, mint chutney, and mild spices.	https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&auto=format&fit=crop&q=80	Veg Sandwich	60.00	100	2026-09-15 23:28:08.056157+05:30	d9ba10c1-0302-41e5-81e3-4786640fe534
606e2e98-824a-44d1-abf5-9000ef849313	t	BEVERAGES	2026-09-15 23:28:08.060157+05:30	Traditional brewed masala chai with milk, cardamom, and fresh ginger.	https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=80	Tea	15.00	200	2026-09-15 23:28:08.060157+05:30	d9ba10c1-0302-41e5-81e3-4786640fe534
26cf06b8-f203-43c2-bf46-d8d4976d42ea	t	BEVERAGES	2026-09-15 23:28:08.067201+05:30	Freshly brewed South Indian filter coffee with frothy hot milk.	https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80	Coffee	25.00	200	2026-09-15 23:28:08.067201+05:30	d9ba10c1-0302-41e5-81e3-4786640fe534
4a307579-c763-4719-adc6-4ede06c0e9ca	t	BEVERAGES	2026-09-15 23:28:08.072776+05:30	Chilled freshly squeezed lime juice with mint and sugar or salt.	https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80	Fresh Lime Juice	30.00	100	2026-09-15 23:28:08.072776+05:30	d9ba10c1-0302-41e5-81e3-4786640fe534
0f63d016-d46c-435f-bef6-444a49366e58	t	RESTAURANT	2026-09-15 23:28:08.029348+05:30	Crispy golden rice crepe filled with spiced potato masala, served with sambar and fresh coconut chutney.	https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80	Masala Dosa	50.00	100	2026-09-15 23:31:16.574593+05:30	d9ba10c1-0302-41e5-81e3-4786640fe534
5f535bee-011c-485b-aa8d-f361f886f86a	t	GROCERY	2026-09-18 20:53:29.305757+05:30	sample	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQssQu1Taz5UruSofowQaLyT1iFkj-VWOCfrp-P83MrIA&s=10	demo	1000.00	78	2026-09-20 22:29:16.360672+05:30	6d077f57-c95f-455c-b87b-260f2a4ea317
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, created_at, expiry_date, revoked, token, user_id) FROM stdin;
9c2769b9-5239-405a-82ea-241e5d58ced3	2026-09-17 23:23:39.113055+05:30	2026-09-24 23:23:39.112099+05:30	t	2ac0f66f-8133-4652-aabb-e36772ac2bf9	ac632fe5-565c-4f20-a3da-bd600b338ae7
ae879868-42d6-444d-b353-f9cbf0bdb5c3	2026-09-10 12:28:51.291286+05:30	2026-09-17 12:28:51.291286+05:30	f	09b1b91f-0705-484f-bc2e-4594110d9d22	32c32872-6fe9-403e-8e5f-30f9ea6c4a3f
a18608f4-e6fc-4bb6-833c-203d04d74142	2026-09-10 12:14:15.017781+05:30	2026-09-17 12:14:15.016693+05:30	t	9130ce77-0e2d-4ba9-b4f3-e974b9b21ee7	852eeb10-0003-424a-957d-e1aab2c88b5a
0ccea4da-7ade-451e-b6c7-adef3962ac7e	2026-09-10 12:45:43.544617+05:30	2026-09-17 12:45:43.543617+05:30	t	8368fcaf-d4ec-4bf4-acbb-4c665a04a0b6	852eeb10-0003-424a-957d-e1aab2c88b5a
9b64c4af-90b9-41f7-b50d-9d7274fb2488	2026-09-10 20:07:37.591042+05:30	2026-09-17 20:07:37.584751+05:30	f	79d6e0a5-2396-405d-8c41-d5cb862bc998	f039ebd2-9673-458d-a9d1-58ce1ad50985
ff83fc53-18d5-4d60-8605-a5cd745a13bd	2026-09-10 20:14:01.549947+05:30	2026-09-17 20:14:01.548938+05:30	t	37613ff8-e287-4ee6-b5b2-1d661e94cd59	b0bcc2bc-d6bf-4385-8888-ed0bde8fcff8
41395b23-9177-41e8-aca2-1b8f77803c20	2026-09-10 20:14:22.99735+05:30	2026-09-17 20:14:22.99735+05:30	f	33e90925-d60f-41eb-9373-1b4482bd88a7	b0bcc2bc-d6bf-4385-8888-ed0bde8fcff8
57662be2-d112-4b8f-93b7-09eee46d84a0	2026-09-10 16:41:23.62313+05:30	2026-09-17 16:41:23.62211+05:30	t	6946e383-b927-4557-8720-9cd4425a409b	852eeb10-0003-424a-957d-e1aab2c88b5a
9bb10cc5-bc90-4336-84e9-0a1303400c72	2026-09-10 21:33:01.019062+05:30	2026-09-17 21:33:01.019062+05:30	t	1689ed27-05a2-46b9-a6a6-55b17158cd54	852eeb10-0003-424a-957d-e1aab2c88b5a
b9d03de8-85d3-42dc-85a3-43a65048de8f	2026-09-10 21:33:06.427228+05:30	2026-09-17 21:33:06.426232+05:30	t	f9598eb3-cbdb-476f-a53d-ccd13f9cae32	852eeb10-0003-424a-957d-e1aab2c88b5a
67fd0e3a-ded9-4b3f-a3ed-8f47368a0b57	2026-09-11 22:10:14.658444+05:30	2026-09-18 22:10:14.649429+05:30	t	27779f9b-d6ce-4881-92b0-9578b80d6e4a	852eeb10-0003-424a-957d-e1aab2c88b5a
5749e1c3-ec76-428f-b8db-179a277193e8	2026-09-15 22:29:47.988013+05:30	2026-09-22 22:29:47.980653+05:30	t	7d96617e-f240-4af0-8e19-5e8f2c124c5c	852eeb10-0003-424a-957d-e1aab2c88b5a
2b05ec52-4697-4927-93a2-fe666d30ddda	2026-09-15 22:48:22.675727+05:30	2026-09-22 22:48:22.674718+05:30	t	7a86e44b-a247-40ad-8e77-7b92575df023	852eeb10-0003-424a-957d-e1aab2c88b5a
726d9026-8ff4-4d89-b288-aed5e9e9a704	2026-09-15 23:05:45.20376+05:30	2026-09-22 23:05:45.20376+05:30	t	ea38752b-c1b1-42cc-8a36-38a735aaac96	852eeb10-0003-424a-957d-e1aab2c88b5a
df157fe1-2c10-49fd-8eca-3a9b9f72de9e	2026-09-15 23:28:38.870083+05:30	2026-09-22 23:28:38.869081+05:30	t	098ef250-1ac0-4c56-94a9-33eafe834e25	852eeb10-0003-424a-957d-e1aab2c88b5a
2c930656-b2eb-42f5-80d3-f5384d093ddd	2026-09-15 23:42:57.333928+05:30	2026-09-22 23:42:57.332929+05:30	t	b67e712d-271e-462a-b4f7-8c527b6c86eb	852eeb10-0003-424a-957d-e1aab2c88b5a
6e7b3385-c1eb-46d5-a4c3-7e770868dfb1	2026-09-16 19:21:12.990962+05:30	2026-09-23 19:21:12.974661+05:30	t	ecf9b244-1911-4df2-8289-0579fc133d96	852eeb10-0003-424a-957d-e1aab2c88b5a
c3aabb36-af07-4778-bfee-3cd86d1e08af	2026-09-16 19:22:24.677133+05:30	2026-09-23 19:22:24.677133+05:30	t	d70346d2-8bda-4069-bb7f-1061bc77b256	fe57dc39-9a6b-4a91-8de4-e66f721b6684
c3555684-5b67-4619-9a48-a450839cd470	2026-09-16 21:47:04.911548+05:30	2026-09-23 21:47:04.904511+05:30	t	9ad31145-d30d-4cc5-9fe0-155cf07baa88	fe57dc39-9a6b-4a91-8de4-e66f721b6684
aee4fc3b-57e9-4bbc-a010-891ce1555613	2026-09-16 23:02:23.814366+05:30	2026-09-23 23:02:23.796547+05:30	t	2eab7ca6-fc7d-4356-bf5d-74e32a02d144	ac632fe5-565c-4f20-a3da-bd600b338ae7
3584ccfa-270f-46d2-bfcb-252384d5bd40	2026-09-16 23:13:48.456256+05:30	2026-09-23 23:13:48.455459+05:30	t	86e13c6d-4453-4a3e-8877-34b41ecf536c	ac632fe5-565c-4f20-a3da-bd600b338ae7
40dc6510-86f5-4666-8156-1b5d3cdfcc6c	2026-09-16 22:08:54.590076+05:30	2026-09-23 22:08:54.590076+05:30	t	b54a2bc5-f7ad-4c93-96de-4292f5ea59fc	fe57dc39-9a6b-4a91-8de4-e66f721b6684
f3b6c35e-b046-4e83-9ebd-5a3d2f089dd8	2026-09-16 23:27:02.384132+05:30	2026-09-23 23:27:02.383148+05:30	t	af1f67e8-b6db-431b-92a4-3e269916c0f7	fe57dc39-9a6b-4a91-8de4-e66f721b6684
c4adb2a3-bf80-43f6-81f1-d2414b57d026	2026-09-17 20:45:23.694575+05:30	2026-09-24 20:45:23.673881+05:30	t	819a6c79-7ba0-4ec6-a022-26da89bd1653	ac632fe5-565c-4f20-a3da-bd600b338ae7
a106fec7-7b6a-49b7-b2f0-57021ca90ee5	2026-09-17 21:43:29.46772+05:30	2026-09-24 21:43:29.466722+05:30	t	41f40ccc-16b0-4a3a-b52d-86e3c4633c35	ac632fe5-565c-4f20-a3da-bd600b338ae7
87f0a2ec-7ffa-4af0-bd90-3473bc23fc64	2026-09-17 22:12:41.289665+05:30	2026-09-24 22:12:41.288543+05:30	t	56076783-142f-4816-8419-fbfd923f001b	ac632fe5-565c-4f20-a3da-bd600b338ae7
2c9d5b68-b0df-4ed3-b80b-e6ba6b2c7818	2026-09-17 22:41:19.999417+05:30	2026-09-24 22:41:19.999417+05:30	t	0c7371e8-31f1-404f-89b0-ebfbde923bdb	ac632fe5-565c-4f20-a3da-bd600b338ae7
400accf1-27a8-403f-8df1-d104c269a5bd	2026-09-17 22:53:07.820565+05:30	2026-09-24 22:53:07.820565+05:30	t	606f3cc9-8382-41e8-9092-91d9e1a61170	ac632fe5-565c-4f20-a3da-bd600b338ae7
2492c5f1-7b1c-4a19-a6ef-1edb339e3faa	2026-09-17 22:58:59.759817+05:30	2026-09-24 22:58:59.7588+05:30	t	5d5034f1-a608-4f70-9ded-919f5bd42088	ac632fe5-565c-4f20-a3da-bd600b338ae7
2ed635ae-5b8d-4220-9ea8-38c5e45736f4	2026-09-17 23:03:23.528304+05:30	2026-09-24 23:03:23.528304+05:30	t	18c6940c-5fa7-4907-96d6-707e160b6cb8	ac632fe5-565c-4f20-a3da-bd600b338ae7
2bdb6980-10fb-4d1d-bc56-19a9bd9be12d	2026-09-17 23:07:06.8041+05:30	2026-09-24 23:07:06.8041+05:30	t	ad7e03f6-5d2d-44bb-8713-80ea96550f7f	ac632fe5-565c-4f20-a3da-bd600b338ae7
73b282bd-62d4-4a04-9ef8-5c85387fbd87	2026-09-18 19:41:43.373124+05:30	2026-09-25 19:41:43.370885+05:30	t	bd891da5-012d-40df-bc64-05d7e28ec849	ac632fe5-565c-4f20-a3da-bd600b338ae7
557b8092-c6eb-4b4b-b9f3-9fcbe40c93e5	2026-09-18 20:45:12.647231+05:30	2026-09-25 20:45:12.641192+05:30	t	574566a2-0645-4d99-8bf4-dd2fdfb19f1b	ac632fe5-565c-4f20-a3da-bd600b338ae7
fcb78113-4e0e-41b5-8b30-87cb8b216329	2026-09-18 20:45:18.684332+05:30	2026-09-25 20:45:18.684332+05:30	t	d70b612b-3415-4622-855e-3030ac35681f	852eeb10-0003-424a-957d-e1aab2c88b5a
4bda8068-64b2-4f7f-8f88-d98587587623	2026-09-18 20:51:41.013917+05:30	2026-09-25 20:51:41.013917+05:30	t	922f5f4f-d6e5-4d54-a3bd-4cd55ec3b2db	fe57dc39-9a6b-4a91-8de4-e66f721b6684
9387dece-0725-4d83-aa8d-6f37b8f4da8d	2026-09-18 20:53:37.064263+05:30	2026-09-25 20:53:37.063362+05:30	t	5233fa4f-54a7-4d7e-9f21-11f79b4972f7	852eeb10-0003-424a-957d-e1aab2c88b5a
ca5cb1d3-2fa5-4bec-8d37-ff76fed3d120	2026-09-18 20:54:41.58449+05:30	2026-09-25 20:54:41.583494+05:30	t	9abee194-5b26-42e1-907a-bb1a79e43578	fe57dc39-9a6b-4a91-8de4-e66f721b6684
b8b909b7-3fa8-413b-a966-40644413375f	2026-09-18 20:55:36.720188+05:30	2026-09-25 20:55:36.720188+05:30	t	4ea336c8-fc64-4223-b26e-751eb131739d	852eeb10-0003-424a-957d-e1aab2c88b5a
0df3ad9b-121a-473e-8755-42eb71ac82e0	2026-09-18 20:56:44.812853+05:30	2026-09-25 20:56:44.812853+05:30	t	9e5d70cd-dd62-46c9-bcf7-c8ff9d9c1e7a	fe57dc39-9a6b-4a91-8de4-e66f721b6684
44cf1fba-1df2-4130-91ad-99b41f81c480	2026-09-18 20:57:36.411084+05:30	2026-09-25 20:57:36.410088+05:30	t	18dc8cf3-418c-4606-bcd6-03771c226ed4	852eeb10-0003-424a-957d-e1aab2c88b5a
71a49551-1189-41e1-8214-f0de6f719d47	2026-09-18 20:57:58.452463+05:30	2026-09-25 20:57:58.452463+05:30	t	2e8a22da-ca8f-4651-a81f-c95b78cf3f45	fe57dc39-9a6b-4a91-8de4-e66f721b6684
9eab5f41-9d68-4a2d-81ad-0c2b26e06fbc	2026-09-18 20:58:21.631768+05:30	2026-09-25 20:58:21.630769+05:30	t	f002d564-c7a5-40c5-8ef1-e5b276d6844a	852eeb10-0003-424a-957d-e1aab2c88b5a
b1c66cd4-823d-475b-846d-c59ce1f4ea91	2026-09-18 20:58:41.395971+05:30	2026-09-25 20:58:41.395971+05:30	t	019c1674-0914-4e75-8578-c083609aecaa	fe57dc39-9a6b-4a91-8de4-e66f721b6684
303dc09e-8692-4697-9f4b-724a0f9c9fab	2026-09-19 21:39:02.676573+05:30	2026-09-26 21:39:02.673626+05:30	t	166a1688-9002-4ba3-b084-fbbf11d053bd	fe57dc39-9a6b-4a91-8de4-e66f721b6684
fb8d9ecd-b7c9-4ccb-987c-f88960d58100	2026-09-19 21:39:37.427693+05:30	2026-09-26 21:39:37.426789+05:30	t	4920fa1b-7582-4650-bb84-0674ac29e120	852eeb10-0003-424a-957d-e1aab2c88b5a
6c59d115-55d1-4c78-966b-84fa3f5f816e	2026-09-19 21:40:15.765818+05:30	2026-09-26 21:40:15.765818+05:30	t	74192dac-2652-4153-ae5a-622d2410699b	fe57dc39-9a6b-4a91-8de4-e66f721b6684
5f0ba469-8899-4c72-b2f2-6b8fa9b6da5f	2026-09-19 21:40:50.051318+05:30	2026-09-26 21:40:50.051318+05:30	t	c2eeda96-9a39-4cc8-a72d-17d1981a307f	852eeb10-0003-424a-957d-e1aab2c88b5a
601c2d64-dee5-45dd-8f5e-4760add69159	2026-09-19 22:01:46.308532+05:30	2026-09-26 22:01:46.307533+05:30	t	5be2c5d0-ddf9-4727-81e8-0ed97175a9a7	852eeb10-0003-424a-957d-e1aab2c88b5a
d6604096-a6c3-401b-8575-58059a79f313	2026-09-19 22:18:09.35975+05:30	2026-09-26 22:18:09.35975+05:30	t	f2ef770f-ec97-4f9f-bf5e-826ec0b104f2	852eeb10-0003-424a-957d-e1aab2c88b5a
d6d0af19-c76a-43b1-b52f-70ce12746b81	2026-09-19 22:31:47.900779+05:30	2026-09-26 22:31:47.900779+05:30	t	84547f2b-884e-46cf-b5bb-087d1dc696c2	fe57dc39-9a6b-4a91-8de4-e66f721b6684
0e0cb207-67a0-4bbe-9968-9cba0f5e7581	2026-09-19 22:34:54.921938+05:30	2026-09-26 22:34:54.921938+05:30	t	bfab60cc-49c3-4e4a-b51e-3b9d843c19a2	852eeb10-0003-424a-957d-e1aab2c88b5a
4bc9ac3d-9da6-4857-840e-b8bcd7018f4d	2026-09-19 22:38:26.03429+05:30	2026-09-26 22:38:26.033008+05:30	t	26b42140-aa5b-4447-8593-4ec9e021aa07	fe57dc39-9a6b-4a91-8de4-e66f721b6684
a613ac1f-74a7-41c3-8a86-185ff9bc223a	2026-09-19 22:39:06.051208+05:30	2026-09-26 22:39:06.051208+05:30	t	404ad40d-54cb-4148-aafb-003db1be748b	ac632fe5-565c-4f20-a3da-bd600b338ae7
f7ca426f-7cb7-47a2-bd20-4f40e45d9921	2026-09-19 22:43:30.937245+05:30	2026-09-26 22:43:30.937245+05:30	t	f54d275d-d8fe-420c-9d11-b0b7606f4acc	852eeb10-0003-424a-957d-e1aab2c88b5a
a4578108-cd88-4696-a840-8695825c956c	2026-09-19 23:10:38.891586+05:30	2026-09-26 23:10:38.891586+05:30	t	7dab58b0-4eca-4e5a-9a0b-b687d6f0335b	852eeb10-0003-424a-957d-e1aab2c88b5a
7a2d494e-00c7-4b9c-acf7-489cd23c00c7	2026-09-19 23:20:47.611328+05:30	2026-09-26 23:20:47.610322+05:30	t	f04de7e4-db11-43c3-a9dd-19d52c4315a3	fe57dc39-9a6b-4a91-8de4-e66f721b6684
000ed218-50da-45de-9aeb-ace5232edf4c	2026-09-19 23:21:16.120096+05:30	2026-09-26 23:21:16.120096+05:30	t	1c04e094-fdc8-4ac8-a1a4-76a8de8d0440	852eeb10-0003-424a-957d-e1aab2c88b5a
85d44d3c-9bf7-4af4-b787-f61533ff1359	2026-09-19 23:21:48.495814+05:30	2026-09-26 23:21:48.495814+05:30	t	8a4778d3-839e-422e-a429-2a844465ce79	fe57dc39-9a6b-4a91-8de4-e66f721b6684
f70638bf-3ad8-4585-a4d1-f37b8028fa1e	2026-09-19 23:22:53.825728+05:30	2026-09-26 23:22:53.825728+05:30	t	832ea551-1c0a-4d63-b05d-ecdd94947581	852eeb10-0003-424a-957d-e1aab2c88b5a
341d37b7-9391-4821-8ec6-6fa7be2f7d3f	2026-09-19 23:23:55.469518+05:30	2026-09-26 23:23:55.468004+05:30	t	5f1eef20-a076-459a-a6bd-fa76d1db095b	fe57dc39-9a6b-4a91-8de4-e66f721b6684
240492f9-16a8-4648-a9b3-7955aeb246ff	2026-09-20 18:36:17.738657+05:30	2026-09-27 18:36:17.700676+05:30	t	5be33d9a-b1a9-4e79-b966-ca6c9a70680a	fe57dc39-9a6b-4a91-8de4-e66f721b6684
8c9ae5a6-28b4-4140-8449-1d18dc98687a	2026-09-20 19:14:33.907041+05:30	2026-09-27 19:14:33.906043+05:30	t	44c8c023-5ef5-47c9-a4b6-1212f647bcb0	fe57dc39-9a6b-4a91-8de4-e66f721b6684
c079c44c-ca0d-4c4d-b7b5-02940f42a655	2026-09-20 19:14:49.131754+05:30	2026-09-27 19:14:49.131754+05:30	t	5f729ef9-a4ab-4639-8b62-a62fdb83ee79	852eeb10-0003-424a-957d-e1aab2c88b5a
9b7f2831-3eda-449e-96a3-e02a5e8b6df7	2026-09-20 19:15:06.15591+05:30	2026-09-27 19:15:06.15591+05:30	t	fe4006dd-7bfd-4d18-8872-44a8ad5070ef	fe57dc39-9a6b-4a91-8de4-e66f721b6684
05118714-738f-492c-9c03-579cc89437d7	2026-09-20 19:15:23.117751+05:30	2026-09-27 19:15:23.117751+05:30	t	6d0c52e4-e14a-454b-a48a-6a5e0777bbf2	852eeb10-0003-424a-957d-e1aab2c88b5a
2324d927-2bb2-477a-b053-0821f945ada9	2026-09-20 19:30:23.325988+05:30	2026-09-27 19:30:23.324979+05:30	t	69baf62f-4eb4-4dca-a7cc-0587ac6f8c70	852eeb10-0003-424a-957d-e1aab2c88b5a
6b4bddd5-a607-4645-83ae-55dab2c4634d	2026-09-20 19:32:40.627049+05:30	2026-09-27 19:32:40.627049+05:30	t	3cdf4a7e-458b-4745-b1ca-61fb36d60f23	fe57dc39-9a6b-4a91-8de4-e66f721b6684
064ef7c3-10d8-4d82-987b-1724bb3626b3	2026-09-20 19:45:42.526601+05:30	2026-09-27 19:45:42.526601+05:30	t	ce5f6a09-86de-4fc1-a532-cca26c305cda	852eeb10-0003-424a-957d-e1aab2c88b5a
c32a0703-cd87-4a37-973b-abc2d478c2b8	2026-09-20 19:46:35.918773+05:30	2026-09-27 19:46:35.918773+05:30	t	7cb25c8c-bc5a-4ecf-a0e4-37c6b039ebc8	ac632fe5-565c-4f20-a3da-bd600b338ae7
0d03baa4-3260-4091-9504-1f4d743a7e13	2026-09-20 19:57:55.011729+05:30	2026-09-27 19:57:55.011729+05:30	t	d5496841-035c-4eb5-b076-9be84238eb28	852eeb10-0003-424a-957d-e1aab2c88b5a
001ae5b9-00d9-488d-861a-584d4b69989f	2026-09-20 21:00:05.456743+05:30	2026-09-27 21:00:05.456743+05:30	t	623eb6fc-a2f7-4734-90c5-0d55de02bb8e	852eeb10-0003-424a-957d-e1aab2c88b5a
c2b9acad-67f5-483e-aa51-d8b999233866	2026-09-20 21:00:18.655638+05:30	2026-09-27 21:00:18.655638+05:30	t	3c01b691-fde8-4cd2-a29f-89dee08fdd3d	fe57dc39-9a6b-4a91-8de4-e66f721b6684
c7eeadc2-0d88-4b4c-aead-b3751b29b407	2026-09-20 21:21:54.30543+05:30	2026-09-27 21:21:54.304413+05:30	t	b9271877-76b8-48d8-9d12-393f6e78ffa4	fe57dc39-9a6b-4a91-8de4-e66f721b6684
4650764c-4672-4b95-9817-d04c20525a16	2026-09-20 21:23:01.722491+05:30	2026-09-27 21:23:01.722491+05:30	t	9c9fb2db-0ea2-4448-afd3-28853bb43ddb	852eeb10-0003-424a-957d-e1aab2c88b5a
2769e36f-91e4-417f-839f-8f5adcc28996	2026-09-20 21:44:18.772922+05:30	2026-09-27 21:44:18.753848+05:30	t	3adb0d98-f41f-470f-8861-4ef2aef4461c	852eeb10-0003-424a-957d-e1aab2c88b5a
2ce927a0-56cd-40dc-a970-b0580a6f3bbb	2026-09-20 22:29:09.110981+05:30	2026-09-27 22:29:09.102871+05:30	t	c30a9d2a-4804-4a19-948b-7dc736a53c91	852eeb10-0003-424a-957d-e1aab2c88b5a
ac6e489b-e376-42b0-8d5e-64b6e02082dc	2026-09-21 18:11:52.530484+05:30	2026-09-28 18:11:52.485501+05:30	t	3912243b-8a19-4448-b1f0-bc806b9bb107	852eeb10-0003-424a-957d-e1aab2c88b5a
f077e155-c7a3-4c9f-8a84-fa56efd325b7	2026-09-21 18:53:40.746666+05:30	2026-09-28 18:53:40.739432+05:30	t	669000d6-5e50-4037-a90a-655813acc993	852eeb10-0003-424a-957d-e1aab2c88b5a
42fae4ea-0828-42a1-aaec-2bd6d5e1c6a8	2026-09-21 19:08:46.931294+05:30	2026-09-28 19:08:46.931294+05:30	t	24773460-760e-47fb-af3a-8e1fe6c72b5f	852eeb10-0003-424a-957d-e1aab2c88b5a
5416ca1d-956e-4252-97b0-431d151b438f	2026-09-21 19:24:00.192946+05:30	2026-09-28 19:24:00.192946+05:30	t	31165eb7-d9ed-43f7-8bdc-3c13c271d6cc	852eeb10-0003-424a-957d-e1aab2c88b5a
70bc2e25-d88d-4b7d-8e78-2f8071a2e62f	2026-09-21 20:48:02.710966+05:30	2026-09-28 20:48:02.699976+05:30	t	4168d0c8-8a98-4ca2-830a-517eb9a86dc4	852eeb10-0003-424a-957d-e1aab2c88b5a
85b21ffe-bc10-4afa-af1d-992f7d836181	2026-09-21 21:13:44.574888+05:30	2026-09-28 21:13:44.574888+05:30	t	74613521-ee3f-4b88-ab84-ff5ffb542a24	852eeb10-0003-424a-957d-e1aab2c88b5a
d1e5c2a6-2db4-4634-a906-28b67badcba5	2026-09-21 22:36:42.451102+05:30	2026-09-28 22:36:42.451102+05:30	t	11e391b7-5948-44ed-aaf7-8ccd0c9b37d0	852eeb10-0003-424a-957d-e1aab2c88b5a
8ac9368e-870c-44d8-9468-d257c464e852	2026-09-21 23:00:49.101684+05:30	2026-09-28 23:00:49.101684+05:30	t	7af9adac-58a4-40f8-b904-ecfbd17d9e5f	852eeb10-0003-424a-957d-e1aab2c88b5a
47067f0b-a6f1-4bc2-bce0-ff3d3de6838b	2026-09-21 23:19:07.7446+05:30	2026-09-28 23:19:07.7446+05:30	t	5d7e51ca-b108-47e7-97c1-a4fb3eb6e181	852eeb10-0003-424a-957d-e1aab2c88b5a
d5be2d9f-e939-4fa4-81b2-7635b7e71e62	2026-09-21 23:39:28.153809+05:30	2026-09-28 23:39:28.153809+05:30	t	17cfed01-d933-4c4d-8a43-b06224694bcc	852eeb10-0003-424a-957d-e1aab2c88b5a
84f227aa-507d-4cd0-8e31-e6b6cfbad7e8	2026-10-14 11:53:09.084109+05:30	2026-10-21 11:53:09.051111+05:30	f	60e987e1-bdda-4f91-85e4-db50c267d818	852eeb10-0003-424a-957d-e1aab2c88b5a
\.


--
-- Data for Name: shops; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.shops (id, address, category, city, closing_time, created_at, description, latitude, longitude, opening_time, phone, shop_name, status, updated_at, owner_id, valid_complaint_count, image_url) FROM stdin;
d9ba10c1-0302-41e5-81e3-4786640fe534	Student Activity Center, Campus Ground Floor	RESTAURANT	Bangalore	22:00:00	2026-09-15 23:28:08.013251+05:30	Campus dining & cafeteria serving fresh South Indian breakfast, snacks, hot beverages, and fresh juices.	12.9716	77.5946	07:30:00	9990000002	Campus Cafe	ACTIVE	2026-09-15 23:28:08.013251+05:30	0d642d6d-39d1-4236-94fa-1b22dc3d3947	0	\N
cc69918d-ec3f-4b39-8f2e-ce373835dca6	Block B Commercial Complex, Room 102	BAKERY	Bangalore	20:00:00	2026-09-16 23:25:55.980883+05:30	Fresh artisan breads, pastries, cookies, and evening snacks for campus students.	12.972	77.595	08:00:00	9990000002	Campus Bakery & Snacks	PENDING	2026-09-20 19:53:00.673556+05:30	0d642d6d-39d1-4236-94fa-1b22dc3d3947	0	\N
6d077f57-c95f-455c-b87b-260f2a4ea317	422, Erode Road (east),Vellakovil, Tiruppur - 638111	GROCERY	Tiruppur	21:00:00	2026-09-16 22:20:48.861623+05:30	\N	10.824718	77.02205	09:00:00	9344179922	Demo	ACTIVE	2026-09-20 21:22:40.720691+05:30	fe57dc39-9a6b-4a91-8de4-e66f721b6684	0	/api/uploads/shops/shop_6d077f57c95f455cb87b260f2a4ea317_1789919519929.jpg
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.system_settings (setting_key, category, description, updated_at, updated_by, setting_value) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, account_status, created_at, email, full_name, password, phone, role, updated_at, valid_complaint_count) FROM stdin;
852eeb10-0003-424a-957d-e1aab2c88b5a	ACTIVE	2026-09-10 12:14:14.922996+05:30	mahaaswinsb@gmail.com	Maha Aswin S B	$2a$10$akoM4jVJSPn8yRDE6Z.9SuxQt4Yf/5sj140QtIBA1bpYp1cVfY052	+919344179922	CUSTOMER	2026-09-10 12:14:14.922996+05:30	0
32c32872-6fe9-403e-8e5f-30f9ea6c4a3f	ACTIVE	2026-09-10 12:28:51.28976+05:30	alex.customer@test.com	Alex Customer	$2a$10$CfCZVWvvaU6PhzfMcavqVeyt0tYOK.fikwV5045hHgJFGlOGUokK6	9876543210	CUSTOMER	2026-09-10 12:28:51.28976+05:30	0
f039ebd2-9673-458d-a9d1-58ce1ad50985	ACTIVE	2026-09-10 20:07:37.090991+05:30	test_uniq_1789051055433@example.com	Test User	$2a$10$YQDg7at.Z8BCukpCtYpIRukShOyE.m5dLye6rLgPcCPln56s.SwRa	9876541978	CUSTOMER	2026-09-10 20:07:37.090991+05:30	0
b0bcc2bc-d6bf-4385-8888-ed0bde8fcff8	ACTIVE	2026-09-10 20:14:01.546836+05:30	mahaaswin@gmail.com	Maha Aswin S B	$2a$10$chuhbdNNorvmEncKV9bC1e.kSTzDJtQY0MIGHqUW3zlNAYhHawM1K	919344179922	CUSTOMER	2026-09-10 20:14:01.546836+05:30	0
188216a5-ef0a-4299-8e38-921b36ea0e35	ACTIVE	2026-09-15 23:28:07.829874+05:30	customer@queueless.com	Test Customer	$2a$10$F3QYI9HVUPczGgeVmD2B9eABo6/jO1LE9io3pmEpP3RzkS1G.QRuy	9990000001	CUSTOMER	2026-09-15 23:28:07.829874+05:30	0
0d642d6d-39d1-4236-94fa-1b22dc3d3947	ACTIVE	2026-09-15 23:28:07.929451+05:30	owner@campuscafe.com	Campus Cafe Owner	$2a$10$54qDGZYg.rMrsxtp8.x2TuXLXmDIUvOLzWqslhDMxBBxLkU00OruS	9990000002	SHOP_OWNER	2026-09-15 23:28:07.929451+05:30	0
fe57dc39-9a6b-4a91-8de4-e66f721b6684	ACTIVE	2026-09-16 19:22:24.675133+05:30	owner@gmail.com	Owner	$2a$10$mYxkGxkoMPU0LFNp0wdyLOigCoFNvI9ldjQKsgD/CecG1z/5Q.4kS	9874563210	SHOP_OWNER	2026-09-16 19:22:24.675133+05:30	0
ac632fe5-565c-4f20-a3da-bd600b338ae7	ACTIVE	2026-09-15 23:28:07.997069+05:30	admin@queueless.com	System Admin	$2a$10$ua.YgwPben.LBsCG4mfFuuodU7lF/YZwxJ0IUIoesRFHqNK9opghC	9990000003	ADMIN	2026-09-16 23:25:56.022196+05:30	0
\.


--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: carts carts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT carts_pkey PRIMARY KEY (id);


--
-- Name: complaint_evidence complaint_evidence_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_evidence
    ADD CONSTRAINT complaint_evidence_pkey PRIMARY KEY (id);


--
-- Name: complaint complaint_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint
    ADD CONSTRAINT complaint_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: pickup_otp pickup_otp_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pickup_otp
    ADD CONSTRAINT pickup_otp_pkey PRIMARY KEY (id);


--
-- Name: pickup_slots pickup_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pickup_slots
    ADD CONSTRAINT pickup_slots_pkey PRIMARY KEY (id);


--
-- Name: pickup_token pickup_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pickup_token
    ADD CONSTRAINT pickup_token_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: shops shops_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT shops_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (setting_key);


--
-- Name: pickup_token uk5xb75p83fw01ylih8wneu6b5x; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pickup_token
    ADD CONSTRAINT uk5xb75p83fw01ylih8wneu6b5x UNIQUE (token_hash);


--
-- Name: users uk6dotkott2kjsp8vw4d0m25fb7; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uk6dotkott2kjsp8vw4d0m25fb7 UNIQUE (email);


--
-- Name: carts uk88sv4i13lo80s74ox7rsb5a2c; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT uk88sv4i13lo80s74ox7rsb5a2c UNIQUE (customer_id);


--
-- Name: pickup_slots uk9jfngn8d4dkvh4bg8ltekjire; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pickup_slots
    ADD CONSTRAINT uk9jfngn8d4dkvh4bg8ltekjire UNIQUE (order_id);


--
-- Name: users ukdu5v5sr43g5bfnji4vb8hg5s3; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT ukdu5v5sr43g5bfnji4vb8hg5s3 UNIQUE (phone);


--
-- Name: refresh_tokens ukghpmfn23vmxfu3spu3lfg4r2d; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT ukghpmfn23vmxfu3spu3lfg4r2d UNIQUE (token);


--
-- Name: pickup_otp uklwfxy7u0x52ggnbjgdygwv40t; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pickup_otp
    ADD CONSTRAINT uklwfxy7u0x52ggnbjgdygwv40t UNIQUE (order_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_cart_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_customer ON public.carts USING btree (customer_id);


--
-- Name: idx_cart_item_cart; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_item_cart ON public.cart_items USING btree (cart_id);


--
-- Name: idx_cart_item_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_cart_item_product ON public.cart_items USING btree (product_id);


--
-- Name: idx_complaint_complainant; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaint_complainant ON public.complaint USING btree (complainant_id);


--
-- Name: idx_complaint_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaint_order ON public.complaint USING btree (order_id);


--
-- Name: idx_complaint_reported_shop; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaint_reported_shop ON public.complaint USING btree (reported_shop_id);


--
-- Name: idx_complaint_reported_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaint_reported_user ON public.complaint USING btree (reported_user_id);


--
-- Name: idx_complaint_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_complaint_status ON public.complaint USING btree (status);


--
-- Name: idx_evidence_complaint; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_evidence_complaint ON public.complaint_evidence USING btree (complaint_id);


--
-- Name: idx_notification_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_created ON public.notifications USING btree (created_at);


--
-- Name: idx_notification_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_read ON public.notifications USING btree (read);


--
-- Name: idx_notification_recipient; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_recipient ON public.notifications USING btree (recipient_id);


--
-- Name: idx_notification_recipient_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notification_recipient_read ON public.notifications USING btree (recipient_id, read);


--
-- Name: idx_order_customer; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_customer ON public.orders USING btree (customer_id);


--
-- Name: idx_order_item_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_item_order ON public.order_items USING btree (order_id);


--
-- Name: idx_order_item_product; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_item_product ON public.order_items USING btree (product_id);


--
-- Name: idx_order_shop; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_shop ON public.orders USING btree (shop_id);


--
-- Name: idx_order_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_order_status ON public.orders USING btree (status);


--
-- Name: idx_pickup_otp_consumed; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pickup_otp_consumed ON public.pickup_otp USING btree (consumed);


--
-- Name: idx_pickup_otp_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pickup_otp_expires ON public.pickup_otp USING btree (expires_at);


--
-- Name: idx_pickup_otp_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pickup_otp_hash ON public.pickup_otp USING btree (otp_hash);


--
-- Name: idx_pickup_otp_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pickup_otp_order ON public.pickup_otp USING btree (order_id);


--
-- Name: idx_pickup_slot_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pickup_slot_order ON public.pickup_slots USING btree (order_id);


--
-- Name: idx_pickup_slot_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pickup_slot_status ON public.pickup_slots USING btree (status);


--
-- Name: idx_pickup_token_expires; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pickup_token_expires ON public.pickup_token USING btree (expires_at);


--
-- Name: idx_pickup_token_hash; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pickup_token_hash ON public.pickup_token USING btree (token_hash);


--
-- Name: idx_pickup_token_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pickup_token_order ON public.pickup_token USING btree (order_id);


--
-- Name: idx_pickup_token_used; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_pickup_token_used ON public.pickup_token USING btree (used);


--
-- Name: idx_product_available; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_available ON public.products USING btree (available);


--
-- Name: idx_product_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_category ON public.products USING btree (category);


--
-- Name: idx_product_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_name ON public.products USING btree (name);


--
-- Name: idx_product_shop; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_product_shop ON public.products USING btree (shop_id);


--
-- Name: idx_shop_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_category ON public.shops USING btree (category);


--
-- Name: idx_shop_city; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_city ON public.shops USING btree (city);


--
-- Name: idx_shop_name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_name ON public.shops USING btree (shop_name);


--
-- Name: idx_shop_owner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_owner ON public.shops USING btree (owner_id);


--
-- Name: idx_shop_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_shop_status ON public.shops USING btree (status);


--
-- Name: refresh_tokens fk1lih5y2npsf8u5o3vhdb9y0os; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT fk1lih5y2npsf8u5o3vhdb9y0os FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: cart_items fk1re40cjegsfvw58xrkdp6bac6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fk1re40cjegsfvw58xrkdp6bac6 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: complaint_evidence fk1wj5k4nidjhv2mbo7kidj5gqv; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint_evidence
    ADD CONSTRAINT fk1wj5k4nidjhv2mbo7kidj5gqv FOREIGN KEY (complaint_id) REFERENCES public.complaint(id);


--
-- Name: orders fk21gttsw5evi5bbsvleui69d7r; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fk21gttsw5evi5bbsvleui69d7r FOREIGN KEY (shop_id) REFERENCES public.shops(id);


--
-- Name: complaint fk41c4bxy7dvnvtuy3mg4htqng2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint
    ADD CONSTRAINT fk41c4bxy7dvnvtuy3mg4htqng2 FOREIGN KEY (reviewed_by_id) REFERENCES public.users(id);


--
-- Name: complaint fk583ey6kk5v2hk9bvmv06c8bvh; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint
    ADD CONSTRAINT fk583ey6kk5v2hk9bvmv06c8bvh FOREIGN KEY (complainant_id) REFERENCES public.users(id);


--
-- Name: products fk7kp8sbhxboponhx3lxqtmkcoj; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT fk7kp8sbhxboponhx3lxqtmkcoj FOREIGN KEY (shop_id) REFERENCES public.shops(id);


--
-- Name: carts fk99i1rh5nm7r3f1b3wdcuq5h57; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.carts
    ADD CONSTRAINT fk99i1rh5nm7r3f1b3wdcuq5h57 FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- Name: complaint fkbc3sl1cky60xfjmo3dp9kqd04; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint
    ADD CONSTRAINT fkbc3sl1cky60xfjmo3dp9kqd04 FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items fkbioxgbv59vetrxe0ejfubep1w; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkbioxgbv59vetrxe0ejfubep1w FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: complaint fkbspb54ay167slix5xbvmx5h1y; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint
    ADD CONSTRAINT fkbspb54ay167slix5xbvmx5h1y FOREIGN KEY (reported_user_id) REFERENCES public.users(id);


--
-- Name: pickup_otp fkcigtqwrlgyj2dq4r0kqk96by6; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pickup_otp
    ADD CONSTRAINT fkcigtqwrlgyj2dq4r0kqk96by6 FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- Name: pickup_slots fke0b8pyv4werlajxcr32wrgyw; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pickup_slots
    ADD CONSTRAINT fke0b8pyv4werlajxcr32wrgyw FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: complaint fkjdh7tkqh4ab167vlagu88rgo7; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.complaint
    ADD CONSTRAINT fkjdh7tkqh4ab167vlagu88rgo7 FOREIGN KEY (reported_shop_id) REFERENCES public.shops(id);


--
-- Name: pickup_token fkmrbd8heqflkm9r8w19t6p7ojp; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pickup_token
    ADD CONSTRAINT fkmrbd8heqflkm9r8w19t6p7ojp FOREIGN KEY (order_id) REFERENCES public.orders(id);


--
-- Name: order_items fkocimc7dtr037rh4ls4l95nlfi; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT fkocimc7dtr037rh4ls4l95nlfi FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: cart_items fkpcttvuq4mxppo8sxggjtn5i2c; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT fkpcttvuq4mxppo8sxggjtn5i2c FOREIGN KEY (cart_id) REFERENCES public.carts(id);


--
-- Name: notifications fkqqnsjxlwleyjbxlmm213jaj3f; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fkqqnsjxlwleyjbxlmm213jaj3f FOREIGN KEY (recipient_id) REFERENCES public.users(id);


--
-- Name: shops fkrduswa89ayj0poad3l70nag19; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.shops
    ADD CONSTRAINT fkrduswa89ayj0poad3l70nag19 FOREIGN KEY (owner_id) REFERENCES public.users(id);


--
-- Name: orders fksjfs85qf6vmcurlx43cnc16gy; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT fksjfs85qf6vmcurlx43cnc16gy FOREIGN KEY (customer_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict f02toMc6hzpPkmVe9GSHhom7le7xwS1SF3kWubSrHDVfFM43MuRuaW27ANsZJud

