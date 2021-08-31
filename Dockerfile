FROM ghcr.io/tsickert/curl-ubuntu

ADD webhook.sh /webhook.sh

ENTRYPOINT [ "/webhook.sh" ]
