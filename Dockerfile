FROM ubuntu

ADD entrypoint.sh entrypoint.sh

RUN apt update && apt upgrade && apt install curl

ENTRYPOINT [ "/entrypoint.sh" ]