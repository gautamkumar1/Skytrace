# Aviation AI POC — production-ready image
FROM python:3.12-slim

WORKDIR /app

# System deps for psycopg2
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ src/
COPY dashboard/ dashboard/
COPY main.py .

# Default: run dashboard; override to run CLI (e.g. docker run ... python main.py --case ...)
ENV PYTHONPATH=/app
CMD ["python", "-m", "dashboard.app"]
