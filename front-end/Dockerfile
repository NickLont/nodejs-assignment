## Specifying base image
FROM node:11

## Creating base dir
RUN mkdir -p /front-end

## Globally install yarn inside container
RUN npm install yarn -g

## Set base dir as working dir for Docker
WORKDIR /front-end

## Copy and install packages
COPY --chown=node:node package.json .
COPY --chown=node:node yarn.lock .
RUN yarn install --silent
COPY --chown=node:node . .

## Set environment to 'development'
ENV NODE_ENV development

## Allow PORT to be publically available
EXPOSE 3011

## run the application
CMD ["yarn", "start"]