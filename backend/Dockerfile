FROM node:16

RUN apt-get update && apt-get install -y\
     default-jdk \
     build-essential \
     && apt-get clean

WORKDIR /usr/src/app

COPY . .

RUN if [-f "package.json"]; then npm install; fi

RUN node -v && javac -version && java -version && g++ --version

EXPOSE 3000

CMD ["/bin/bash"]