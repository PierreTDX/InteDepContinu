# pull official base image
FROM node:24-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin' to $PATH
ENV PATH="/app/node_modules/.bin:${PATH}"

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --silent

EXPOSE 3000

# Start the Vite development server (exposed to all network interfaces)
CMD ["npm", "run", "dev", "--", "--host"]