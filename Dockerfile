FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./backend /app/backend

CMD ["gunicorn", "backend.main:app", "--bind", "0.0.0.0:10000"]