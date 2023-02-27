FROM python:3.10-slim-buster

# Project mounted inside container
WORKDIR /backend-flask

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

# . . evrything is the current directory
# first period : /backend-flash (outside container)
# second period : /backend-flash (inside container)

COPY . .

# Set env vars
ENV FLASK_ENV=development

EXPOSE ${PORT}

# ADD external-script.sh /backend-flask/external-script.sh

# RUN chmod 777 /backend-flask/external-script.sh

# CMD /backend-flask/external-script.sh

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=4567"]
#python3 -m flask run --host=0.0.0.0 --port=4567