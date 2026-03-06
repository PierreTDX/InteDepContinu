#Create MySQL Image for JSP Tutorial Application
FROM mysql:9.6
COPY ./sqlfiles/ /docker-entrypoint-initdb.d/
EXPOSE 3306