FROM python:3.9.10-bullseye

ENV GO_VERSION 1.17.7
ENV NODE_VERSION 16.14.0

ENV GOPATH /go
ENV GOPRIVATE github.com/weathernews
ENV PATH $GOPATH/bin:/usr/local/go/bin:/usr/local/node/bin:$PATH

RUN set -ex \
        && apt-get update -y && apt-get install -y \
                httpie \
                jq \
                less \
                zip \
                zsh \
        && apt-get clean \
        && rm -rf /var/lib/apt/lists/* \
        \
        && ARCH= && dpkgArch="$(dpkg --print-architecture)" \
        && case "${dpkgArch##*-}" in amd64) ARCH="x86_64";; arm64) ARCH="aarch64";; *) echo "unsupported architecture ${dpkgArch}"; exit 1;; esac \
        \
        && wget https://awscli.amazonaws.com/awscli-exe-linux-${ARCH}.zip \
        && unzip awscli-exe-linux-${ARCH}.zip && ./aws/install \
        && rm -rf aws awscli-exe-linux-${ARCH}.zip \
        \
        && chsh -s $(which zsh) \
        && echo "dash dash/sh boolean false" | debconf-set-selections \
        && DEBIAN_FRONTEND=noninteractive dpkg-reconfigure dash

RUN set -ex \
        && pip install --no-cache-dir --upgrade pip && pip install --no-cache-dir \
                aws-sam-cli \
                ipython \
                \
                autopep8 \
                cfn-lint \
                flake8 \
                \
                auth0-python \
                aws-lambda-powertools \
                awswrangler \
                python-decouple \
                requests \
                retrying \
                ulid-py \
                \
                pytest \
                pytest-cov \
                pytest-mock

RUN set -ex \
        && ARCH= && dpkgArch="$(dpkg --print-architecture)" \
        && case "${dpkgArch##*-}" in amd64) ARCH="amd64";; arm64) ARCH="arm64";; *) echo "unsupported architecture ${dpkgArch}"; exit 1;; esac \
        \
        && wget https://golang.org/dl/go${GO_VERSION}.linux-${dpkgArch}.tar.gz \
        && tar -C /usr/local -xzf go${GO_VERSION}.linux-${dpkgArch}.tar.gz \
        && rm go${GO_VERSION}.linux-${dpkgArch}.tar.gz && mkdir -p "${GOPATH}/src" "${GOPATH}/bin" && chmod -R 777 "${GOPATH}" \
        \
        && go install \
                github.com/golang/mock/mockgen@latest \
        && go clean

RUN set -ex \
        \
        && ARCH= && dpkgArch="$(dpkg --print-architecture)" \
        && case "${dpkgArch##*-}" in amd64) ARCH="x64";; arm64) ARCH="arm64";; *) echo "unsupported architecture ${dpkgArch}"; exit 1;; esac \
        \
        && wget https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${ARCH}.tar.xz \
        && mkdir -p /usr/local/node && tar -C /usr/local/node -xJf node-v${NODE_VERSION}-linux-${ARCH}.tar.xz --strip-components=1 \
        && rm node-v${NODE_VERSION}-linux-${ARCH}.tar.xz \
        \
        && npm install -g npm && npm install -g \
                eslint \
                http-server

WORKDIR /root/develop

CMD [ "/bin/zsh" ]
