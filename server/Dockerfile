# Use an official Python runtime as a parent image
FROM python:3.10-slim

# Prevent Python from writing pyc files and display logs immediately
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# Create a non-root user for security
RUN addgroup --system appgroup \
    && adduser --system --ingroup appgroup appuser

# Install dependencies in a cached layer
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Give ownership of the files to appuser
COPY --chown=appuser:appgroup . .

# Switch to the non-root user
USER appuser

# Document the port (published at runtime with -p)
EXPOSE 8000

# Start the API
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]