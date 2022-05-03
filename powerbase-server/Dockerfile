FROM ruby:3.0.1
RUN apt-get update -qq && apt-get install -y nodejs postgresql-client

RUN mkdir /usr/src/app
WORKDIR /usr/src/app
ADD Gemfile /usr/src/app/Gemfile
ADD Gemfile.lock /usr/src/app/Gemfile.lock
RUN bundle install
ADD . /usr/src/app

COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]
EXPOSE 4001

CMD ["rails", "server", "-p", "4001", "-b", "0.0.0.0"]