FROM nginx
COPY . /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf