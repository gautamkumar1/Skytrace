-- Create llp_parts table in Snowflake (AVIATION_AI.POC or your configured DB/schema).
-- Run this when you want the LLP page to use dynamic data instead of mock data.
-- The frontend qual("llp_parts") expects lowercase table name; use quoted identifier.

CREATE TABLE IF NOT EXISTS "AVIATION_AI"."POC"."llp_parts" (
    "ID" VARCHAR(64) NOT NULL,
    "CASE_ID" VARCHAR(128) NOT NULL,
    "REGISTRATION" VARCHAR(32) NOT NULL,
    "AIRCRAFT_TYPE" VARCHAR(64) NOT NULL,
    "PART_NUMBER" VARCHAR(64) NOT NULL,
    "PART_NAME" VARCHAR(256),
    "SERIAL_NUMBER" VARCHAR(64) NOT NULL,
    "POSITION" VARCHAR(32),
    "LIFE_UNIT" VARCHAR(8) NOT NULL,  -- FH, FC, CAL
    "CURRENT_USED" NUMBER(12,2) NOT NULL DEFAULT 0,
    "LIFE_LIMIT" NUMBER(12,2) NOT NULL,
    "BTB_STATUS" VARCHAR(32) NOT NULL DEFAULT 'pending_review',  -- verified, pending_review, gap, overdue
    "NEXT_INSPECTION_DATE" DATE,
    "LAST_BTB_VERIFIED_AT" DATE,
    "NOTES" VARCHAR(2000),
    PRIMARY KEY ("ID")
);

-- Example insert (adjust DB/schema if different):
-- INSERT INTO "AVIATION_AI"."POC"."llp_parts" (ID, CASE_ID, REGISTRATION, AIRCRAFT_TYPE, PART_NUMBER, PART_NAME, SERIAL_NUMBER, POSITION, LIFE_UNIT, CURRENT_USED, LIFE_LIMIT, BTB_STATUS) VALUES
-- ('llp-1', 'CASE-A320-001', 'G-EZAB', 'A320-214', 'PN-7342-01', 'HPT Stage 1 Blade', 'SN-8821', 'ENG1', 'FC', 12420, 20000, 'verified');
