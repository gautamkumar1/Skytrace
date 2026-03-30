import os
import json
import random
from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:ServerDb%402026@localhost:5432/postgres")

engine = create_engine(DATABASE_URL)

CASES = [
    "GEN-A320200-001", "GEN-B737800-001", "GEN-A321200-001",
    "GEN-B737700-001", "GEN-A319100-001", "GEN-A320200NEO-001",
    "GEN-A321200NEO-001", "GEN-737MAX8-001", "GEN-A330200-001"
]

SEVERITIES = ["STOP", "FLAG", "ADVISORY", "CLEAR"]
CATEGORIES = [
    "Corrosion Inspection", 
    "Engine Borescope", 
    "Maintenance Record Review", 
    "Structural Airworthiness", 
    "AD/SB Compliance",
    "Fluid Leak Check"
]

def seed():
    try:
        with engine.connect() as conn:
            print(f"Connected to {DATABASE_URL}")
            
            # First, check if cases exist (they should, based on earlier query)
            res = conn.execute(text("SELECT case_id FROM cases"))
            existing_cases = [row[0] for row in res]
            
            target_cases = [c for c in CASES if c in existing_cases]
            if not target_cases:
                print("No matching cases found in DB. Please ensure cases are created first.")
                return

            print(f"Seeding findings for {len(target_cases)} cases...")
            
            for case_id in target_cases:
                # Generate 8 historical findings spread over 18 months for each case
                # This ensures a rich timeline with multiple status changes
                for i in range(1, 9):
                    # Higher probability of CLEAR, but diverse enough to show Red/Amber
                    severity = random.choices(SEVERITIES, weights=[0.1, 0.2, 0.3, 0.4])[0]
                    category = random.choice(CATEGORIES)
                    
                    # Distribute findings over the last 18 months
                    # We use a deterministic-ish distribution so it looks like "monthly" checks
                    months_ago = i * 2 # 2, 4, 6, 8... 16 months ago
                    created_at = datetime.now() - timedelta(days=months_ago * 30 + random.randint(0, 20))
                    
                    finding_id = f"hist-{case_id}-{i}"
                    title = f"Historical {category} Audit"
                    evidence = f"Analysis of historical maintenance logs from {created_at.strftime('%B %Y')} indicates a {severity} status for {category}."
                    
                    conn.execute(
                        text("""
                        INSERT INTO findings (id, case_id, agent_name, severity, category, title, evidence, confidence, iteration, created_at, metadata_json)
                        VALUES (:id, :case_id, :agent, :severity, :category, :title, :evidence, :conf, :iter, :date, :meta)
                        ON CONFLICT (id) DO UPDATE SET
                            severity = EXCLUDED.severity,
                            created_at = EXCLUDED.created_at,
                            evidence = EXCLUDED.evidence
                        """),
                        {
                            "id": finding_id,
                            "case_id": case_id,
                            "agent": "Historical_Seeder",
                            "severity": severity,
                            "category": category,
                            "title": title,
                            "evidence": evidence,
                            "conf": round(0.85 + (random.random() * 0.1), 2),
                            "iter": 0,
                            "date": created_at,
                            "meta": json.dumps({"historical": True, "source": "Audit Seeder"})
                        }
                    )
            conn.commit()
            print("Seeded historical findings successfully.")
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed()
