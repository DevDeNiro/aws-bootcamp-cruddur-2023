# Week 2 — Distributed Tracing

### Implement HoneyComb service : 

Honeycomb is a powerful tool for monitoring and troubleshooting software applications. It is based on OpenTelemetry(OTEL), it's an open-source framework that provides a set of APIs, libraries, and agents to collect distributed traces, metrics, and logs from software applications.

#### Using Honeycomb : 

Firsly, I signed up for an account and had an environmnent created. I persist the HONEYCOMB_API_KEY get from the environment, to the env variables in gitpod, with the service name determine in the span : We Configure OpenTelemetry to send events to Honeycomb using environment variables.
 
```
export HONEYCOMB_API_KEY="YOUR_API_KEY"
export HONEYCOMB_SERVICE_NAME="Cruddur"

gp env HONEYCOMB_API_KEY="YOUR_API_KEY"
gp env HONEYCOMB_SERVICE_NAME="Cruddur"
```

- To Install packages, we setup manually those library into the requirements file, which are going to be run with cmd :
```pip install -r requirements.txt```: 

```py
opentelemetry-api
opentelemetry-sdk
opentelemetry-exporter-otlp-proto-http
opentelemetry-instrumentation-flask
opentelemetry-instrumentation-requests  
```

Add these lines to your existing Flask app initialization file ```app.py```. These updates will create and initialize a tracer and Flask instrumentation to send data to Honeycomb:

```py
from opentelemetry import trace
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

[... some code]

# Initialize tracing and an exporter that can send data to Honeycomb
provider = TracerProvider()
processor = BatchSpanProcessor(OTLPSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)

[... some code]

# Initialize automatic instrumentation with Flask
app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()
```

The header x-honeycomb-team is your API key. Your service name will be used as the Service Dataset in Honeycomb, which is where data is stored. The service name is specified by OTEL_SERVICE_NAME.


- We setup them into the dockerfile to build them into the backend flask app python app.py

```
export OTEL_EXPORTER_OTLP_ENDPOINT="https://api.honeycomb.io"
export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=scQeIOjsMEeUwN7IIKhTmF"
export OTEL_SERVICE_NAME="your-service-name"
```

#### Running traces in HoneyComb

we create on home_activities a mock of data to capture traces on Honeycomb as you can see on my home_activities.py()

- If we start a new activities on ```api/activities/home``` endpoints, we can see the span on Honeycomb :
![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/e84aa032b79f9298ce1d2e7f8fbdcf5d3bbd8701/_docs/assets/week2/recent%20track%20from%20activities%20home.png)

For more informations on the SDK, check the [HeneyComb](https://docs.honeycomb.io/getting-data-in/opentelemetry/python/) documemtation

### Implement AWS X-RAY

X-ray is a service provided by Amazon Web Services (AWS) that allows developers to trace requests through their distributed applications. It provides a visualization of how requests propagate through an application and how resources are utilized, making it easier to identify performance issues and troubleshoot problems.

To use the service, we had to setup a deamon. It's another container that run alongside the app to send data to Xray API to visaluazise it in XRAY.

Firstly, add the AWS SDK to download the librairies : ```aws-xray-sdk``` -> ```pip install -r requirements.txt```

Add to ```app.py``` : 
```
from aws_xray_sdk.core import xray_recorder
from aws_xray_sdk.ext.flask.middleware import XRayMiddleware

xray_url = os.getenv("AWS_XRAY_URL")
xray_recorder.configure(service='Cruddur', dynamic_naming=xray_url)
XRayMiddleware(app, xray_recorder)
```

Add docker service to docker compose

Then, setup the resources  by creating new ```aws/json/xray.json``` file :
```
{
  "SamplingRule": {
      "RuleName": "Cruddur",
      "ResourceARN": "*",
      "Priority": 9000,
      "FixedRate": 0.1,
      "ReservoirSize": 5,
      "ServiceName": "Cruddur",
      "ServiceType": "*",
      "Host": "*",
      "HTTPMethod": "*",
      "URLPath": "*",
      "Version": 1
  }
}
```

To create a new group, copy / paste this into the terminal :

```
aws xray create-group \
   --group-name "Cruddur" \
   --filter-expression "service(\"backend-flask\")"
```

Then, i created a simpling rule using :

```aws xray create-sampling-rule --cli-input-json file://aws/json/xray.json```

Finally, i added the configuration file in my [docker-compose.yml](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/4e60582cb1c1a873e648b7a49dfa3a299e848cf5/docker-composer.yml) to set my env variables and get the xray deamon image from docker hub. Then, i run ;y docker-compose up and go to the endpoint to check if the X-ray is storing data :

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/4e60582cb1c1a873e648b7a49dfa3a299e848cf5/_docs/assets/week2/tests%20trace%20from%20xray.png)

Unfortunately, the service is returning 500 error ;(

### Implement Rollbar

Rollbar is an error tracking and debugging tool that helps developers monitor and troubleshoot errors in their software applications. It allows developers to capture and analyze errors and exceptions in real-time, providing insights into application behavior and performance.

To use roolbar service, i go to the [rollbar](https://rollbar.com/) site and sign up, create a nez project called Cruddur, and get the ROLLBAR ACCESS TOKEN

Then, to my reauirememt.txt, i add 
```
blinker
rollbar
```

Install the SDK needed : ```pip install -r requirements.txt```

Set the access get previously to GITPOD env to persist data :
```
export ROLLBAR_ACCESS_TOKEN=""
gp env ROLLBAR_ACCESS_TOKEN=""
```

And then, add ROLLBAR_ACCESS_TOKEN in docker-compose.txt : ```ROLLBAR_ACCESS_TOKEN: "${ROLLBAR_ACCESS_TOKEN}"```

In the app.py : 

```py
import rollbar
import rollbar.contrib.flask
from flask import got_request_exception

[...some codes]
rollbar_access_token = os.getenv('ROLLBAR_ACCESS_TOKEN')
@app.before_first_request
def init_rollbar():
    """init rollbar module"""
    rollbar.init(
        # access token
        rollbar_access_token,
        # environment name
        'production',
        # server root directory, makes tracebacks prettier
        root=os.path.dirname(os.path.realpath(__file__)),
        # flask already sets up logging
        allow_logging_basic_config=False)

    # send exceptions from `app` to rollbar, using flask's signal system.
    got_request_exception.connect(rollbar.contrib.flask.report_exception, app)
```

Then, always in the app.py, we had an endpoint just for testing rollbar :
```
@app.route('/rollbar/test')
def rollbar_test():
    rollbar.report_message('Hello World!', 'warning')
    return "Hello World!"
```
If we visit the url and go back to Rollbar, we can see our first metrics !

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/4e60582cb1c1a873e648b7a49dfa3a299e848cf5/_docs/assets/week2/rollbar%20OK.png)
### Implement CloudWatch

Amazon CloudWatch is a monitoring and observability service provided by Amazon Web Services (AWS). It allows developers and system administrators to collect and track metrics, collect and monitor log files, and set alarms for resource utilization and performance.

To use this service, add the sdk to ```reauirememts.txt``` : ```watchtower``` then run : ```pip install -r requirements.txt``` 

In my ```app.py```, i add : 
```py
import watchtower
import logging
from time import strftime

[... some code]
# Configuring Logger to Use CloudWatch
LOGGER = logging.getLogger(__name__)
LOGGER.setLevel(logging.DEBUG)
console_handler = logging.StreamHandler()
cw_handler = watchtower.CloudWatchLogHandler(log_group='cruddur')
LOGGER.addHandler(console_handler)
LOGGER.addHandler(cw_handler)
# We log something in an API endpoind
LOGGER.info("some message")

[... some code]
@app.after_request
def after_request(response):
    timestamp = strftime('[%Y-%b-%d %H:%M]')
    LOGGER.error('%s %s %s %s %s %s', timestamp, request.remote_addr, request.method, request.scheme, request.full_path, response.status)
    return response
```
Check the cloudwatch console: 

![image](https://github.com/Noodles-boop/aws-bootcamp-cruddur-2023/blob/4e60582cb1c1a873e648b7a49dfa3a299e848cf5/_docs/assets/week2/cloudwatch%20activities%20OK.png)

Don't forget to disable xRay / Cloudwatch to avoid any kind of spends ! 
