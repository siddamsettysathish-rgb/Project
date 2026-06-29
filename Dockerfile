FROM nginx:1.27-alpine

LABEL maintainer="demo-team"
LABEL description="Static website for Kubernetes CI/CD demo"

COPY src/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ || exit 1
