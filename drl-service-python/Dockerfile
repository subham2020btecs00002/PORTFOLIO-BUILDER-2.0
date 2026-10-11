# ─────────────────────────────────────────────────────────────────────────────
# Portfolio Intelligence Service Dockerfile
# Production-ready, non-root user, lean Python 3.11 image
# ─────────────────────────────────────────────────────────────────────────────

FROM python:3.11-slim AS runtime

# Set environment variables for performance and Python buffering
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    PORT=10000

# Install minimal OS dependencies needed for numerical computing
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Create application directory
WORKDIR /app

# Copy dependency definition first for Docker layer caching
COPY requirements.txt .

# Install dependencies without caching to minimize image size
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Download essential NLTK tokenizers (quiet mode)
RUN python -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('averaged_perceptron_tagger', quiet=True)"

# Copy application source code and offline data
COPY . .

# Create artifacts directory with appropriate permissions
RUN mkdir -p /app/artifacts && chmod -R 755 /app/artifacts

# Security: Run as a non-privileged user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 10000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:${PORT}/health || exit 1

# Start FastAPI application via Uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
