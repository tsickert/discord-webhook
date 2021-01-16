FROM python:3.7

ADD main.py main.py

ENTRYPOINT [ "python", "main.py" ]