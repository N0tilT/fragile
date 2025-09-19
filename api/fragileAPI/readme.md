# Init

Init api here.
Dockerfile will copy all files from here and run.
"CMD ["gunicorn", "--bind", "0.0.0.0:8000", "your_project_name.wsgi:application"]"
with *8080* port exposed
