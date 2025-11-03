# =============================
# Step 1 — Base image
# =============================
FROM python:3.10-slim

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# =============================
# Step 2 — Working directory
# =============================
WORKDIR /app

# =============================
# Step 3 — Copy dependencies
# =============================
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# =============================
# Step 4 — Copy source code
# =============================
COPY . .

# =============================
# Step 5 — Expose port for Cloud Run
# =============================
EXPOSE 8080

# =============================
# Step 6 — Run your Flask app
# =============================
CMD ["python", "app.py"]
