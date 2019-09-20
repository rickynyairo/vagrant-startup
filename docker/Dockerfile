FROM node:10.15.0

WORKDIR /usr/src/app

# ARG HOST_UID=${HOST_UID:-4000}
# ARG HOST_USER=${HOST_USER:-nodummy}

# RUN [ "${HOST_USER}" == "root" ] || \
#     (adduser -h /home/${HOST_USER} -D -u ${HOST_UID} ${HOST_USER} \
#     && chown -R "${HOST_UID}:${HOST_UID}" /home/${HOST_USER})

# USER ${HOST_USER}

COPY package.json ./

COPY yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3001
