CREATE TABLE users (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email         text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    name          text NOT NULL,
    created_at    timestamptz NOT NULL DEFAULT now(),
    updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE profile (
    id               smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    name             text NOT NULL,
    initials         text NOT NULL,
    role_id          text NOT NULL,
    role_en          text NOT NULL,
    tagline_id       text NOT NULL,
    tagline_en       text NOT NULL,
    bio_id           text NOT NULL,
    bio_en           text NOT NULL,
    location         text NOT NULL,
    email            text NOT NULL,
    phone            text NOT NULL DEFAULT '',
    socials          jsonb NOT NULL DEFAULT '[]'::jsonb,
    availability_id  text NOT NULL,
    availability_en  text NOT NULL,
    updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug               text NOT NULL UNIQUE,
    title_id           text NOT NULL,
    title_en           text NOT NULL,
    summary_id         text NOT NULL,
    summary_en         text NOT NULL,
    description_id     text NOT NULL,
    description_en     text NOT NULL,
    tech               text[] NOT NULL DEFAULT '{}',
    status             text NOT NULL CHECK (status IN ('completed', 'in_progress', 'planned')),
    year               integer NOT NULL,
    live_url           text,
    repo_url           text,
    cover_url          text,
    featured           boolean NOT NULL DEFAULT false,
    sort_order         integer NOT NULL DEFAULT 0,
    created_at         timestamptz NOT NULL DEFAULT now(),
    updated_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX projects_sort_idx ON projects (sort_order, year DESC);
CREATE INDEX projects_featured_idx ON projects (featured) WHERE featured;

CREATE TABLE posts (
    id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug             text NOT NULL UNIQUE,
    title_id         text NOT NULL,
    title_en         text NOT NULL,
    excerpt_id       text NOT NULL,
    excerpt_en       text NOT NULL,
    content_id       text NOT NULL,
    content_en       text NOT NULL,
    tags             text[] NOT NULL DEFAULT '{}',
    reading_minutes  integer NOT NULL DEFAULT 0,
    cover_url        text,
    published        boolean NOT NULL DEFAULT false,
    published_at     timestamptz,
    created_at       timestamptz NOT NULL DEFAULT now(),
    updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX posts_public_idx ON posts (published, published_at DESC);

CREATE TABLE skill_groups (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title_id    text NOT NULL,
    title_en    text NOT NULL,
    items       text[] NOT NULL DEFAULT '{}',
    sort_order  integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE experiences (
    id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company        text NOT NULL,
    role_id        text NOT NULL,
    role_en        text NOT NULL,
    period_id      text NOT NULL,
    period_en      text NOT NULL,
    description_id text NOT NULL,
    description_en text NOT NULL,
    highlights     jsonb NOT NULL DEFAULT '[]'::jsonb,
    tech           text[] NOT NULL DEFAULT '{}',
    sort_order     integer NOT NULL DEFAULT 0,
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE education (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school      text NOT NULL,
    degree_id   text NOT NULL,
    degree_en   text NOT NULL,
    period_id   text,
    period_en   text,
    details_id  text NOT NULL,
    details_en  text NOT NULL,
    highlights  jsonb NOT NULL DEFAULT '[]'::jsonb,
    sort_order  integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE contact_messages (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name       text NOT NULL,
    email      text NOT NULL,
    subject    text NOT NULL,
    message    text NOT NULL,
    is_read    boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX contact_messages_created_idx ON contact_messages (created_at DESC);
