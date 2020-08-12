FROM ubuntu

ADD entrypoint.sh entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]