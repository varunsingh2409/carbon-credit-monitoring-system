from sqlalchemy.dialects import postgresql

from app.services.verification_service import _build_pending_sequestration_lock_stmt


def test_pending_sequestration_lock_stmt_locks_without_outer_joins() -> None:
    compiled = str(
        _build_pending_sequestration_lock_stmt(42).compile(
            dialect=postgresql.dialect(),
            compile_kwargs={"literal_binds": True},
        )
    )

    assert "FOR UPDATE" in compiled
    assert "JOIN" not in compiled
