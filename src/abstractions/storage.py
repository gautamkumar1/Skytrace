"""Abstract storage backend. Application never calls boto3 directly."""
from __future__ import annotations

from abc import ABC, abstractmethod
from typing import BinaryIO


class StorageBackend(ABC):
    """Object storage abstraction. Implementations: S3, local filesystem."""

    @abstractmethod
    def put(self, key: str, body: bytes | BinaryIO, content_type: str | None = None) -> str:
        """Upload object. Returns storage URI or path."""
        ...

    @abstractmethod
    def get(self, key: str) -> bytes:
        """Download object by key."""
        ...

    @abstractmethod
    def exists(self, key: str) -> bool:
        """Check if key exists."""
        ...

    @abstractmethod
    def delete(self, key: str) -> None:
        """Delete object by key."""
        ...
