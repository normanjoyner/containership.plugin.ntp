FROM alpine
RUN apk --update add openntpd
ENTRYPOINT ["ntpd"]
CMD ["-ds"]
