FROM python:3.12-slim

WORKDIR /app


RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

COPY . .


ENV PYTHONUNBUFFERED=1


CMD gunicorn --bind 0.0.0.0:$PORT --timeout 120 --workers 1 app:app
