"""Insert mandatory application roles.

Revision ID: c7d2e8f41a90
Revises: b09059a94aa5
"""

from alembic import op
import sqlalchemy as sa


revision = "c7d2e8f41a90"
down_revision = "b09059a94aa5"
branch_labels = None
depends_on = None


ROLES = [
    ("utilisateur", "Utilisateur de l'application"),
    ("soignant", "Professionnel de santé"),
    ("centre", "Accueil d'un centre de santé"),
    ("admin", "Équipe Laafi Rose"),
]


def upgrade():
    connection = op.get_bind()
    roles_table = sa.table(
        "roles",
        sa.column("code", sa.String(length=30)),
        sa.column("label", sa.String(length=80)),
    )

    existing = set(
        connection.execute(
            sa.select(roles_table.c.code)
        ).scalars()
    )

    for code, label in ROLES:
        if code not in existing:
            connection.execute(
                roles_table.insert().values(code=code, label=label)
            )


def downgrade():
    # Les rôles peuvent être utilisés par des comptes existants.
    # Ne jamais les supprimer automatiquement.
    pass
