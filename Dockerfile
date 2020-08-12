FROM byrnedo/alpine-curl

ADD entrypoint.sh entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]