# Stage 1: Build
FROM python:3.12-slim AS builder
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# --- FIX CVE START ---
# Nâng cấp pip lên bản mới nhất trước khi cài thư viện
RUN pip install --upgrade pip
# --- FIX CVE END ---

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Run (Secure)
FROM python:3.12-slim
WORKDIR /app

# --- FIX CVE START ---
# Image runtime cũng cần pip mới (vì Trivy quét lớp này)
RUN pip install --upgrade pip
# --- FIX CVE END ---

RUN groupadd -r appuser && useradd -r -g appuser appuser
COPY --from=builder /install /usr/local
COPY . .
RUN chown -R appuser:appuser /app
USER appuser
EXPOSE 8000
CMD ["python", "app.py"]