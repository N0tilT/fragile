FROM python:3.11.5-slim-bullseye

ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
WORKDIR /app

COPY ./fragileAPI/requirements.txt .
RUN pip install -r requirements.txt

COPY ./fragileAPI .
EXPOSE 8080

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "your_project_name.wsgi:application"]