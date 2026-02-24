"""Local filesystem implementation of StorageBackend for dev/POC without AWS."""
from __future__ import annotations

import logging
from pathlib import Path
from typing import BinaryIO

from src.abstractions.storage import StorageBackend

logger = logging.getLogger(__name__)


class LocalStorageBackend(StorageBackend):
    """Store objects under a root directory. Key becomes path (slashes allowed)."""

    def __init__(self, root: str | Path = "./data/storage") -> None:
        self._root = Path(root)
        self._root.mkdir(parents=True, exist_ok=True)

    def _path(self, key: str) -> Path:
        p = self._root / key
        p.parent.mkdir(parents=True, exist_ok=True)
        return p

    def put(self, key: str, body: bytes | BinaryIO, content_type: str | None = None) -> str:
        path = self._path(key)
        if isinstance(body, bytes):
            path.write_bytes(body)
        else:
            path.write_bytes(body.read())
        return str(path.resolve())

    def get(self, key: str) -> bytes:
        return self._path(key).read_bytes()

    def exists(self, key: str) -> bool:
        return self._path(key).exists()

    def delete(self, key: str) -> None:
        p = self._path(key)
        if p.exists():
            p.unlink()
