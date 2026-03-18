"""Seed script for Genesis POC aircraft models."""
import os
import sys
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.getcwd())

from src.config import load_settings
from src.backends.database_postgres import PostgresDatabaseBackend
from src.backends.database_snowflake import SnowflakeDatabaseBackend

def get_database():
    settings = load_settings()
    backend_type = getattr(settings, "database_backend", "postgres")
    
    if backend_type == "snowflake":
        account = settings.snowflake_account
        region = getattr(settings, "snowflake_region", "") or ""
        if region and region.strip():
            account = f"{account.strip()}.{region.strip()}"
            
        return SnowflakeDatabaseBackend(
            account=account,
            user=settings.snowflake_user,
            password=settings.snowflake_password or "",
            database=settings.snowflake_database,
            schema=settings.snowflake_schema,
            warehouse=settings.snowflake_warehouse,
            role=settings.snowflake_role or None
        )
    return PostgresDatabaseBackend(settings.database_url)

def seed_models():
    db = get_database()
    
    # 1. Ensure Schema (including new supported_models table)
    from sqlalchemy import text
    try:
        with db.get_connection() as conn:
            conn.execute(text("""
            CREATE TABLE IF NOT EXISTS supported_models (
                model_name VARCHAR(64) PRIMARY KEY,
                manufacturer VARCHAR(64),
                category VARCHAR(64),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """))
            conn.commit()
            print("Ensured supported_models table exists.")
    except Exception as e:
        print(f"Warning: Could not create supported_models table: {e}")

    # 2. Insert Models
    models = [
        ("A320-200", "Airbus", "Narrowbody"),
        ("B737-800", "Boeing", "Narrowbody"),
        ("A321-200", "Airbus", "Narrowbody"),
        ("B737-700", "Boeing", "Narrowbody"),
        ("A319-100", "Airbus", "Narrowbody"),
        ("A320-200NEO", "Airbus", "Narrowbody"),
        ("A321-200NEO", "Airbus", "Narrowbody"),
        ("737-MAX8", "Boeing", "Narrowbody"),
        ("A330-200", "Airbus", "Widebody"),
    ]
    
    for model_name, manufacturer, category in models:
        # Insert into supported_models
        try:
            with db.get_connection() as conn:
                conn.execute(text("""
                INSERT INTO supported_models (model_name, manufacturer, category)
                VALUES (:name, :man, :cat)
                ON CONFLICT (model_name) DO NOTHING
                """), {"name": model_name, "man": manufacturer, "cat": category})
                conn.commit()
        except Exception as e:
            # Snowflake might not support ON CONFLICT, handling gracefully
            print(f"Skipping lookup insert for {model_name}: {e}")

        # Create a sample case for each model to populate the dashboard
        case_id = f"GEN-{model_name.replace('-', '').upper()}-001"
        registration = f"N{model_name.replace('-', '').upper()[:5]}G"
        
        db.insert_case(
            case_id=case_id,
            registration=registration,
            aircraft_type=model_name,
            engine_type="TBD"
        )
        print(f"Seeded case: {case_id} ({model_name})")

if __name__ == "__main__":
    load_dotenv()
    seed_models()
    print("Seeding complete.")
