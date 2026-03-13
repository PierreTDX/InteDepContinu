# Etape 1 : Builder
FROM python:3.10-slim AS builder

WORKDIR /app

# Création d'un environnement virtuel pour isoler les dépendances
RUN python -m venv /opt/venv
# Activation de l'environnement virtuel pour les commandes suivantes
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Etape 2 : Image finale
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app
RUN addgroup --system appgroup \
    && adduser --system --ingroup appgroup appuser

# Copie de l'environnement virtuel depuis l'étape builder
COPY --from=builder --chown=appuser:appgroup /opt/venv /opt/venv
COPY --chown=appuser:appgroup . .

USER appuser
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]