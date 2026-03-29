from typing import Annotated

from fastapi import Depends

from app.auth.dependencies import get_current_user, require_role
from app.models.user import User

CurrentUser = Annotated[User, Depends(get_current_user)]
require_admin = require_role(["admin"])
require_verifier = require_role(["admin", "verifier"])
