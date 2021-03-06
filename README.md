# ptc_test

## FrontService

Install dependencies:

    npm install

Clean last build

    npm run clean

Build the system (format code, lint, compile, copy env files)

    npm run build

Run "FrontService"

    npm run start

Run end-to-end smoke tests

    npm run test

## Directory Structure

| Directory | Content                                       |
| --------- | --------------------------------------------- |
| diagrams  | Diagrams created with PlantUML                |
| out       | Diagrams exported as images                   |
| postman   | Postman collection exported with calls to API |
| src       | source code of solution                       |
| test      | test code                                     |
| .         | configuration and env files                   |

### Architectural overveiw

I designed _FrontService_ as the front service to orchestrate blob and job submission to downstream services _BlobService_ and _JobService_.

High level view of _FrontService_, _BlobService_ and _JobService_ interactions.

![context diagram](out/diagrams/c4_context/c4_context.png?raw=true)

Internal view of components in _FrontService_.

![container diagram](out/diagrams/c4_container/c4_container.png?raw=true)

_FrontService_ is a simple stateless service that uses a mongodb cluster to store it's data, each of the two components can be scaled indipendently when the need arises.

The load balancer allows the API component to be scaled up and down transparently to the users.

For the storage layer I designed the solution to use _mongodb_ because it's a fast document store. The data model used in _FrontService_ is very simple, the service deals only with one kind of objects, jobs, each one stores just a few information to keep track of the orchestration by external services (their ids) and the owner of the resource. For these reasons there's no need for a ACID transactions which would just add overhead on each storage access operation and will pose more problems when scaling (RDBMS are harder hard to scale horizontally, and more costly to scale vertically).

### Assumptions

- _BlobService_ never deletes a blob unless he's told so, but that use case is out of scope, that means that one stored a blob will always be found.
- _JobService_ will overwrite the input blob with the output of its elaboration. That simplifies the communication between the systems but doesn't change the solution.
- _JobService_ will store the output's blob in _BlobService_ before setting the job's status to `SUCCESS`.

### Implementation

Only the _API_ component of the system has been implemented in this PoC, the storage layer as well as the external services are mocked with classes, the internal code architecture allow for an easy switch from mock to real services.

_JobService_ and _BlobService_ mocks are implemented to return errors randomly, as well as different valid expected values.

### API

- `POST /api/v1/job`: post a new job
- `GET /api/v1/job/:jobId/status`: retrieve job's status
- `GET /api/v1/job/:jobId/output`: retrieve job's output (job must be finished)

#### POST /api/v1/job

When submitting a new job to _FrontService_, the system takes care of storing the input blob to _BlobService_ and submitting a job request to _JobService_.

_FrontService_ will return to the user as soon as the needed info is stored locally, then the rest of the orchestration is executed asynchronously.

_FrontService_ is a simple service, in fact it doesn't store the input blob and if an error occurs during the distributed execution of submitting a new job, it doesn't try to re-execute it. It's up to the user to recognize the state of error, by retrieving the job's status, and to reissue the request.

The sequence diagram below illustrate the interacions between the systems in case every API call is successful.

![submit a job, successful](out/diagrams/postjob_sequence_diagram/postjob_sequence_diagram.png?raw=true)

#### GET /api/v1/job/:jobId/status

_FrontService_ always stores the latest information that it knows about a job but it doesn't proactively retrieves it, that means that its information can be stale.

When asked for a job's status _FrontService_ will provide it's local data only if that data is certainly fresh, in our case that means only if the job is in a final status that cannot change.

The sequence diagram below illustrates such case.

![retrieve a job's status, local info](out/diagrams/getstatus_local_sequence_diagram/getstatus_local_sequence_diagram.png?raw=true)

In any other case _FrontService_ will ask _JobService_ for the status of the corresponding job, it will then calculate the current status of the job, update it and answer to the user, as shown in the sequence diagram below.

![retrieve a job's status, local info](out/diagrams/getstatus_jsservice_sequence_diagram/getstatus_jsservice_sequence_diagram.png?raw=true)

#### Job states

Jobs in _FrontService_ can change status as illustrated in the following diagram.

![job statuses](out/diagrams/jobStatus_state_diagram/jobStatus_state_diagram.png?raw=true)

- `CREATED`: when the job is first submitted, it means _FrontService_ stored local info and started orchestrating execution with downstream services.
- `STORED`: successfully stored input blob in _BlobService_.
- `STORED_ERROR`: an error occured while storing the input blob in _BlobService_.
- `SUBMITTED`: succesfully submitted the job to _JobService_ for tis execution.
- `SUBMITTED_ERROR`: an error occured while submitting the job to _JobService_.
- `EXECUTION_COMPLETED`: _JobService_ successfully completed its execution.
- `EXECUTION_ERROR`: _JobService_ couldn't terminate the execution.

#### GET /api/v1/job/:jobId/output

Retrieves the output of the job's execution, this resource doesn't exists until the job is in `EXECUTION_COMPLETED` status.

If _FrontService_ know that the job has completed, it will immediately ask _BlobService_ for the output blob.

![get job output, known completed](out/diagrams/getjob_completed_sequence_diagram/getjob_completed_sequence_diagram.png?raw=true)

Likewise, if it know that the job is in an error state (all error states are terminal), it will immediately return an `HTTP 404` code to the user, because the output resource doesn't exists, and it never will.

![get job output, known error](out/diagrams/getjob_completed_sequence_diagram/../getjob_error_sequence_diagram/getjob_error_sequence_diagram.png?raw=true)

In all the other cases _FrontService_ asks _JobService_ for the status of the corresponding job execution to know if the blob output is ready and can be provided to the user.

![get job output, not ready](out/diagrams/getjob_not_ready_sequence_diagram/getjob_not_ready_sequence_diagram.png?raw=true)

![get job output, completed](out/diagrams/getjob_completed_unknown_sequence_diagram/getjob_completed_unknown_sequence_diagram.png?raw=true)

### Authentication & Authorization

Each API endpoint is authenticated via a Bearer JWT token. Since this is a PoC only a few simple checks are done, and the token is not verified.

The PoC checks that the `audience` provided in the token matches the one configured in the app.

The pair `tenentId` and `sub` from the JWT token are used to identify the users, they are attached to each created job and check before accessing it, only the user that created a job can retrieve it's status and output.

#### Internal Architecture

I developed this Poc organizing the code according to the _Clean Architecture_ pattern.

This pattern organizes code in different layers:

- Domain: contains the domain objects and models their interactions
- UseCases: contain the business logic of the application, organized in use cases.
- Infrastructure: contains all infrastructure code, that is code related to the I/O of the application (http server and storage layer are the mosto common)

Dependencies between these layers is

    Infrastructure -- depends on --> UseCases
    UseCases -- depends on --> Domain
    Domain has no other dependencies

Then there is configuration and bootstrap code that lies outside of these layers (code for reading configuration, setting up the application and starting it).

This architecture allows the developer to concentrate to each single layer without worring about the others, as long as interfaces are clearly defined between them, the application is naturally built to allow easy testing, it is a _screaming architecture_ that means that it's easy to understand what the aplpication does (you can just look at the use cases).

### Further work

To move the PoC to production code obviously the persistence layer should be implemented to use a real mongodb instance. We should also pay better attention to mapping data from outside the application to the inside to be sure we are not introducing a hidden dependency on the shape of data define outside of our control.

For resiliance and performance, a circuit breaker pattern can be implemented in front of _JobService_ and _BlobService_ so when the communication failures reaches a certain threshold, _FrontService_ will (almost) stop trying to communicate with them and fail immediately, sparing the users the timeouts in network communication. The pattern will not stop all the communications, some are still allowed and they serve as a probe to recognize when the downstream service is up and running again, in which case all communication is re-established as normal.

From an architectural point of view, the major drawback of this solution is the synchronous communication between services. This means that if one of the needed services is not available when the request is issued, it will fail.

One mitigation to this situation would be to design a cron job on _FrontService_ side that will look for failed jobs and reissue them, a retry policy should be devised to avoid infinite retries of the same job. This solution would require to store the input blob until job's completion, so that the system will always be able to retry a failed job, and this may have a huge impact in required resources if the system is heavily used.

A structural solution to the synchronous communication whould be to use an asynchronous communication pattern between the services. for example using a persistent queue as a communication channel between _FrontService_ and _JobService_, but that will require support for that kind of communication from _JobService_'s side. This architectrue wuold move the storage requirement of the input blobs and the retry logic to the queue system. _JobService_ would just take jobs from the queue, jobs from the queue are removed only after completion and made unavailable to others while in execution.
