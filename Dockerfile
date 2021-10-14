FROM ghcr.io/tsickert/python

ADD webhook.py /webhook.py

RUN chmod 755 /webhook.py

ENTRYPOINT ["python3", "/webhook.py" ]
