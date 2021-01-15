FROM ubuntu

RUN apt update && apt upgrade -y && apt install -y curl

ADD entrypoint.sh entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]