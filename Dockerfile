FROM mcr.microsoft.com/playwright:v1.63.0-noble

WORKDIR /app

COPY . .
RUN npm install && chmod +x /app/run.sh

ENV LIMIT=50
ENV INTERVAL_SECONDS=172800

CMD ["/app/run.sh"]