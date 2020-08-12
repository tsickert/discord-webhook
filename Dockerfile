FROM curlimages/curl:7.71.1

ADD entrypoint.sh entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]