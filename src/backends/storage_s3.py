"""S3 implementation of StorageBackend. Uses boto3 behind abstraction."""
from __future__ import annotations

import logging
from typing import BinaryIO

import boto3
from botocore.exceptions import ClientError

from src.abstractions.storage import StorageBackend

logger = logging.getLogger(__name__)


class S3StorageBackend(StorageBackend):
    """AWS S3 backend. SHA-256 can be set via metadata by caller."""

    def __init__(
        self,
        bucket: str,
        region: str = "us-east-1",
        aws_access_key_id: str | None = None,
        aws_secret_access_key: str | None = None,
    ) -> None:
        kwargs = {}
        if aws_access_key_id and aws_secret_access_key:
            kwargs["aws_access_key_id"] = aws_access_key_id
            kwargs["aws_secret_access_key"] = aws_secret_access_key
        self._client = boto3.client("s3", region_name=region, **kwargs)
        self._bucket = bucket
        self._region = region

    def put(self, key: str, body: bytes | BinaryIO, content_type: str | None = None) -> str:
        extra = {}
        if content_type:
            extra["ContentType"] = content_type
        if isinstance(body, bytes):
            self._client.put_object(Bucket=self._bucket, Key=key, Body=body, **extra)
        else:
            self._client.upload_fileobj(body, self._bucket, key, ExtraArgs=extra or None)
        return f"s3://{self._bucket}/{key}"

    def get(self, key: str) -> bytes:
        resp = self._client.get_object(Bucket=self._bucket, Key=key)
        return resp["Body"].read()

    def exists(self, key: str) -> bool:
        try:
            self._client.head_object(Bucket=self._bucket, Key=key)
            return True
        except ClientError as e:
            if e.response["Error"]["Code"] == "404":
                return False
            raise

    def delete(self, key: str) -> None:
        self._client.delete_object(Bucket=self._bucket, Key=key)
