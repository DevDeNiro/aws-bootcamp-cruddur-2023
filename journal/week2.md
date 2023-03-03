# Week 2 — Distributed Tracing

### Implement HoneyComb service : 

Honeycomb is a service based on OTEL : OPEN TELEMETRY : standard pour faire de la tetelemetry ... To dig deepr 

- Firsly, setup the HONEYCOMB_API_KEY to the env variables in gitpod :
 
```
export HONEYCOMB_API_KEY="YOUR_API_KEY"
gp env HONEYCOMB_API_KEY="YOUR_API_KEY"
```

- Determine the service name in the span : 

```
export HONEYCOMB_SERVICE_NAME="Cruddur"
gp env HONEYCOMB_SERVICE_NAME="Cruddur"
```

- Create a dataset with Honeycomb :

- Install packages - we setup manually: 

```
pip install opentelemetry-api \
    opentelemetry-sdk \
    opentelemetry-exporter-otlp-proto-http \
    opentelemetry-instrumentation-flask \
    opentelemetry-instrumentation-requests  
```

Add these lines to your existing Flask app initialization file ```app.py```. These updates will create and initialize a tracer and Flask instrumentation to send data to Honeycomb:

```
from opentelemetry import trace
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.requests import RequestsInstrumentor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
```

- Initialize tracing and an exporter that can send data to Honeycomb
```
provider = TracerProvider()
processor = BatchSpanProcessor(OTLPSpanExporter())
provider.add_span_processor(processor)
trace.set_tracer_provider(provider)
tracer = trace.get_tracer(__name__)
```

- Initialize automatic instrumentation with Flask
```
app = Flask(__name__)
FlaskInstrumentor().instrument_app(app)
RequestsInstrumentor().instrument()
```

Configure OpenTelemetry to send events to Honeycomb using environment variables.
The header x-honeycomb-team is your API key. Your service name will be used as the Service Dataset in Honeycomb, which is where data is stored. The service name is specified by OTEL_SERVICE_NAME.


- We setup them into the dockerfile to build them into the backend flask app python app.py

```
export OTEL_EXPORTER_OTLP_ENDPOINT="https://api.honeycomb.io"
export OTEL_EXPORTER_OTLP_HEADERS="x-honeycomb-team=scQeIOjsMEeUwN7IIKhTmF"
export OTEL_SERVICE_NAME="your-service-name"
```

- After we setup our env variables, we create on home_activities, which contains our mock, working capture on Honeycomb 

- Ajout d'un attribut au spans après création du span :
picture

https://docs.honeycomb.io/getting-data-in/opentelemetry/python/

HONEYCOMB SETUP ! 

### [X]  Implement AWS X-RAX for FLASK
### [ ]  Implement CloudWatch Logs
### [ ]  Implement Rollbar
### [ ]  Add Deamon Service to Docker Compose
### [ ]  Instrument Honeycomb for the frontend-application to observe network latency between frontend and backend[HARD]
### [ ]  Add custom instrumentation to Honeycomb to add more attributes eg. UserId, Add a custom span
### [ ]  Run custom queries in Honeycomb and save them later eg. Latency by UserID, Recent Traces
