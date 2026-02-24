"""PDF ingestion pipeline."""
import hashlib
import logging
import uuid
from pathlib import Path
from pypdf import PdfReader
from src.abstractions.ledger import LedgerEventType
from src.schemas.models import IngestedDocument

logger = logging.getLogger(__name__)
MAX_FILE_SIZE_MB = 50
MAX_PAGES = 2000

def _compute_sha256(path):
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()

def _extract_text(path):
    reader = PdfReader(str(path))
    pages = reader.pages
    n = len(pages)
    if n > MAX_PAGES:
        raise ValueError("PDF too many pages")
    parts = []
    for i, page in enumerate(pages):
        if i >= 500:
            break
        try:
            parts.append(page.extract_text() or "")
        except Exception as e:
            logger.warning("Page %s failed: %s", i + 1, e)
    return "\n\n".join(parts), n

def ingest_documents(case_id, docs_dir, storage, database, ledger=None):
    docs_path = Path(docs_dir)
    if not docs_path.is_dir():
        raise FileNotFoundError("Not a directory: " + str(docs_dir))
    max_bytes = MAX_FILE_SIZE_MB * 1024 * 1024
    results = []
    for path in list(docs_path.glob("**/*.pdf")) + list(docs_path.glob("**/*.PDF")):
        if not path.is_file():
            continue
        if path.stat().st_size > max_bytes or path.stat().st_size == 0:
            continue
        content_hash = _compute_sha256(path)
        try:
            text_content, page_count = _extract_text(path)
        except Exception as e:
            logger.warning("Extract failed %s: %s", path.name, e)
            continue
        doc_id = str(uuid.uuid4()).replace("-", "")[:24]
        storage_key = "cases/" + case_id + "/docs/" + doc_id + "_" + path.name
        storage.put(storage_key, path.read_bytes(), content_type="application/pdf")
        text_preview = (text_content or "")[:10000]
        database.insert_document(case_id, doc_id, path.name, content_hash, storage_key, page_count, None)
        doc = IngestedDocument(doc_id=doc_id, case_id=case_id, filename=path.name, content_hash=content_hash,
            storage_key=storage_key, page_count=page_count, text_preview=text_preview, metadata={})
        results.append(doc)
        if ledger:
            ledger.append(LedgerEventType.DOCUMENT_INGESTED.value,
                {"doc_id": doc_id, "case_id": case_id, "filename": path.name, "content_hash": content_hash}, entity_id=doc_id)
        logger.info("Ingested %s -> %s", path.name, doc_id)
    return results
