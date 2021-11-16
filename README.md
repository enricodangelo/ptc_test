# ptc_test

# Solution (FrontService)

The *FrontService* is the interface to the 2 worker services:

- worker.cloud.net: service used to submit jobs and retrieve status
- worker.blob.net: service used to store blobs that are actually used by *worker.cloud.net*

## FrontService

### Architectural overveiw

High level view of *FrontService*, *BlobService* and *JobService*.

![context diagram](out/diagrams/c4_context/c4_context.png?raw=true)

Internal view of components in *FrontService*.

![container diagram](out/diagrams/c4_container/c4_container.png?raw=true)

### API

- POST /api/v1/job: post a new job
- GET /api/v1/job/:jobId: retrieve job's status
- GET /api/v1/job/:jobId/output: retrieve job's output (job must be finished)

### Job states

Jobs in *FrontService* can change status as illustrated in the following diagram.

![job statuses](out/diagrams/jobStatus_state_diagram/jobStatus_state_diagram.png?raw=true)


### Use Cases

#### post a new job

![post a new job sequence diagram](out/diagrams/postjob_ok_sequence_diagram/postjob_ok_sequence_diagram.png?raw=true)

#### get job's output

![get job's output sequence diagram](out/diagrams/getjob_ok_sequence_diagram/getjob_ok_sequence_diagram.png?raw=true)

#### get job status

![get job status sequence diagram](out/diagrams/getstatus_ok_sequence_diagram/getstatus_ok_sequence_diagram.png?raw=true)

