FROM ubuntu

RUN apt update && apt upgrade -y && apt install -y curl

ADD webhook.sh /webhook.sh

ENTRYPOINT [ "/webhook.sh" ]
