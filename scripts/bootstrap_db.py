from __future__ import annotations

from pathlib import Path
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
SEED_SQL_PATH = PROJECT_ROOT / "scripts" / "seed_demo.sql"
FORMAL_CONSTRAINTS_SQL_PATH = PROJECT_ROOT / "scripts" / "formal_schema_constraints.sql"
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app import models  # noqa: F401,E402
from app.db.base import Base  # noqa: E402
from app.db.session import engine  # noqa: E402


def _load_seed_sql() -> str:
    sql_text = SEED_SQL_PATH.read_text(encoding="utf-8")
    lines = [
        line
        for line in sql_text.splitlines()
        if not line.lstrip().startswith("\\")
    ]
    return "\n".join(lines).strip()


def _load_formal_constraints_sql() -> str:
    return FORMAL_CONSTRAINTS_SQL_PATH.read_text(encoding="utf-8").strip()


def main() -> None:
    # The repository currently has models and Alembic config, but no checked-in
    # migration files. Create the schema first, then seed demo data idempotently.
    Base.metadata.create_all(bind=engine)

    seed_sql = _load_seed_sql()
    raw_connection = engine.raw_connection()

    try:
        raw_connection.autocommit = True
        with raw_connection.cursor() as cursor:
            cursor.execute(seed_sql)
            cursor.execute(_load_formal_constraints_sql())
    finally:
        raw_connection.close()


if __name__ == "__main__":
    main()
