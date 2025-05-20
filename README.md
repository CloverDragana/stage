## Prerequisites

------

* Node.js (version 20.10.0 or higher)
* npm (version 10.8.2 or higher)
* Next (version 14)
* React (version 18.2.0 or higher)
* pgAdmin 4

## Installation 

-----

Clone the repository

Install dependencies npm install

Install pgAdmin 4 - https://www.pgadmin.org/download/ for access to PostgreSQL

Setup env variables: apps/.env - apps/api/.env - apps/web/.env.local

Setup pgAdmin 4 PostgreSQL database tables:

 ------

users table-
CREATE TABLE IF NOT EXISTS public.users
(
    userid integer NOT NULL DEFAULT nextval('users_userid_seq'::regclass),
    username character varying(255) COLLATE pg_catalog."default" NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    password text COLLATE pg_catalog."default" NOT NULL,
    dob date,
    gender character varying(20) COLLATE pg_catalog."default" DEFAULT 'Not Specified'::character varying,
    accountstatus character varying(50) COLLATE pg_catalog."default" DEFAULT 'Active'::character varying,
    registrationdate timestamp without time zone NOT NULL DEFAULT now(),
    personal_account boolean NOT NULL DEFAULT false,
    professional_account boolean NOT NULL DEFAULT false,
    profile_type character varying(20) COLLATE pg_catalog."default" NOT NULL DEFAULT 'personal'::character varying,
    fullname character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT users_pkey PRIMARY KEY (userid),
    CONSTRAINT users_email_key UNIQUE (email),
    CONSTRAINT users_username_key UNIQUE (username)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.users
    OWNER to postgres;

    -----
    
profiles table -

CREATE TABLE IF NOT EXISTS public.profiles
(
    profileid integer NOT NULL DEFAULT nextval('profiles_profileid_seq'::regclass),
    userid integer NOT NULL,
    profile_type character varying(20) COLLATE pg_catalog."default" NOT NULL,
    profile_picture text COLLATE pg_catalog."default",
    creative_slogan text COLLATE pg_catalog."default",
    bio text COLLATE pg_catalog."default",
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    banner_image text COLLATE pg_catalog."default",
    star_works text[] COLLATE pg_catalog."default" DEFAULT '{NULL,NULL,NULL}'::text[],
    CONSTRAINT profiles_pkey PRIMARY KEY (profileid),
    CONSTRAINT profiles_userid_fkey FOREIGN KEY (userid)
        REFERENCES public.users (userid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT profiles_profile_type_check CHECK (profile_type::text = ANY (ARRAY['personal'::character varying, 'professional'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.profiles
    OWNER to postgres;

    ------

follows table -

CREATE TABLE IF NOT EXISTS public.follows
(
    follower_profileid integer NOT NULL,
    followed_profileid integer NOT NULL,
    followed_at timestamp without time zone DEFAULT now(),
    CONSTRAINT follows_pkey PRIMARY KEY (follower_profileid, followed_profileid),
    CONSTRAINT follows_followed_fkey FOREIGN KEY (followed_profileid)
        REFERENCES public.profiles (profileid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT follows_follower_fkey FOREIGN KEY (follower_profileid)
        REFERENCES public.profiles (profileid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.follows
    OWNER to postgres;

    -----
posts table - 

CREATE TABLE IF NOT EXISTS public.posts
(
    postid integer NOT NULL DEFAULT nextval('posts_postid_seq'::regclass),
    profileid integer NOT NULL,
    post_type character varying(10) COLLATE pg_catalog."default" NOT NULL,
    post_text text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    post_image text COLLATE pg_catalog."default",
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT posts_pkey PRIMARY KEY (postid),
    CONSTRAINT posts_profileid_fkey FOREIGN KEY (profileid)
        REFERENCES public.profiles (profileid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT posts_post_type_check CHECK (post_type::text = ANY (ARRAY['text'::character varying, 'image'::character varying, 'video'::character varying, 'audio'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.posts
    OWNER to postgres;

------


portfolio table- 


CREATE TABLE IF NOT EXISTS public.portfolio
(
    portfolioid integer NOT NULL DEFAULT nextval('portfolio_portfolioid_seq'::regclass),
    profileid integer NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description text COLLATE pg_catalog."default" NOT NULL,
    content jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    CONSTRAINT portfolio_pkey PRIMARY KEY (portfolioid),
    CONSTRAINT profileid_fkey FOREIGN KEY (profileid)
        REFERENCES public.profiles (profileid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.portfolio
    OWNER to postgres;

------

postinteractions table - 


CREATE TABLE IF NOT EXISTS public.postinteractions
(
    interactionid integer NOT NULL DEFAULT nextval('posts_postid_seq'::regclass),
    postid integer NOT NULL,
    profileid integer NOT NULL,
    postlike boolean NOT NULL DEFAULT false,
    comment text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT postinteraction_pkey PRIMARY KEY (interactionid),
    CONSTRAINT comments_profileid_fkey FOREIGN KEY (profileid)
        REFERENCES public.profiles (profileid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT interaction_postid_fkey FOREIGN KEY (postid)
        REFERENCES public.posts (postid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.postinteractions
    OWNER to postgres;


-----

portfoliointeractions table - 

CREATE TABLE IF NOT EXISTS public.portfoliointeractions
(
    interactionid integer NOT NULL DEFAULT nextval('portfolio_portfolioid_seq'::regclass),
    portfolioid integer NOT NULL,
    profileid integer NOT NULL,
    portfoliolike boolean NOT NULL DEFAULT false,
    comment text COLLATE pg_catalog."default",
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT portfoliointeraction_pkey PRIMARY KEY (interactionid),
    CONSTRAINT interaction_portfolioid_fkey FOREIGN KEY (portfolioid)
        REFERENCES public.portfolio (portfolioid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT portfoliointeraction_profileid_fkey FOREIGN KEY (profileid)
        REFERENCES public.profiles (profileid) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.portfoliointeractions
    OWNER to postgres;




