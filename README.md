# ptc_test

## FrontService

### Architectural overveiw

I designed *FrontService* as the front service to orchestrate blob and job submission to downstream services *BlobService* and *JobService*.


High level view of *FrontService*, *BlobService* and *JobService* interactions.

![context diagram](out/diagrams/c4_context/c4_context.png?raw=true)

Internal view of components in *FrontService*.

![container diagram](out/diagrams/c4_container/c4_container.png?raw=true)

*FrontService* is a simple stateless service that uses a mongodb cluster to store it's data, each of the two components can be scaled indipendently when the need arises. The load balancer allows the API component to be scaled up and down transparently to the users.

### API

- `POST /api/v1/job`: post a new job
- `GET /api/v1/job/:jobId/status`: retrieve job's status
- `GET /api/v1/job/:jobId/output`: retrieve job's output (job must be finished)

#### POST /api/v1/job

When submitting a new job to *FrontService*, it takes care of storing the input blob to *BlobService* and submitting a job request to *JobService*.

*FrontService* will return to the user as soon as the needed info is stored locally, then the rest of the orchestration is executed asynchronously.

*FrontService* is a simple service, in fact it doesn't store the input blob and if an error occurs during the distributed execution of submitting a new job, it doesn't try to re-execute it. It's up to the user to recognize the state of error, by retrieving the job's status, and to reissue the request.

The sequence diagram below illustrate the interacions between the systems in case every API call is successful.

![submit a job, successful](out/diagrams/postjob_sequence_diagram/postjob_sequence_diagram.png?raw=true)

#### GET /api/v1/job/:jobId/status

*FrontService* always stores the latest information that it knows about a job but it doesn't proactively retrieves it, that means that its information can be stale.

When asked for a job's status *FrontService* will provide it's local data only if that data is certainly fresh, in our case that means only if the job is in a final status that cannot change.

The sequence diagram below illustrates such case.

![retrieve a job's status, local info](out/diagrams/getstatus_local_sequence_diagram/getstatus_local_sequence_diagram.png?raw=true)

In any other case *FrontService* will ask *JobService* for the status of the corresponding job, it will then calculate the current status of the job, update it and answer to the user, as shown in the sequence diagram below.

![retrieve a job's status, local info](out/diagrams/getstatus_jsservice_sequence_diagram/getstatus_jsservice_sequence_diagram.png?raw=true)

#### Job states

Jobs in *FrontService* can change status as illustrated in the following diagram.

![job statuses](out/diagrams/jobStatus_state_diagram/jobStatus_state_diagram.png?raw=true)

- CREATED: when the job is first submitted, it means *FrontService* stored local info and started orchestrating execution with downstream services.
- STORED: successfully stored input blob in *BlobService*.
- STORED_ERROR: an error occured while storing the input blob in *BlobService*.
- SUBMITTED: succesfully submitted the job to *JobService* for tis execution.
- SUBMITTED_ERROR: an error occured while submitting the job to *JobService*.
- EXECUTION_COMPLETED: *JobService* successfully completed its execution.
- EXECUTION_ERROR: *JobService* couldn't terminate the execution.

#### GET /api/v1/job/:jobId/output

Retrieves the output of the job's execution, this resource doesn't exists until the job is in `EXECUTION_COMPLETED` status.

If *FrontService* know that the job has completed, it will immediately ask *BlobService* for the output blob.

![get job output, known completed](out/diagrams/getjob_completed_sequence_diagram/getjob_completed_sequence_diagram.png?raw=true)

Likewise, if it know that the job is in an error state (all error states are terminal), it will immediately return an `HTTP 404` code to the user, because the output resource doesn't exists, and it never will.

![get job output, known error](out/diagrams/getjob_completed_sequence_diagram/../getjob_error_sequence_diagram/getjob_error_sequence_diagram.png?raw=true)

In all the other cases *FrontService* asks *JobService* for the status of the corresponding job execution to know if the blob output is ready and can be provided to the user.

![get job output, not ready](out/diagrams/getjob_not_ready_sequence_diagram/getjob_not_ready_sequence_diagram.png?raw=true)

![get job output, completed](out/diagrams/getjob_completed_unknown_sequence_diagram/getjob_completed_unknown_sequence_diagram.png?raw=true)

#### Assumptions

- *BlobService* never deletes a blob unless he's told so, but that use case is out of scope, that means that one stored a blob will always be found.
- *JobService* will overwrite the input blob with the output of its elaboration. That simplifies the communication between the systems but doesn't change the solution.