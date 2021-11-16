# ptc_test

# Solution (FrontService)

The *FrontService* is the interface to the 2 worker services:

- worker.cloud.net: service used to submit jobs and retrieve status
- worker.blob.net: service used to store blobs that are actually used by *worker.cloud.net*

## FrontService

### API

- POST /api/v1/job: post a new job
- GET /api/v1/job/:jobId: retrieve job's status
- GET /api/v1/job/:jobId/output: retrieve job's output (job must be finished)



take the incoming message

validate and verify the message

Create a new Job object

Add following information to job

tenentId
clientId
payload / payload location
payload size
Please write service in a language of your choice


![alt text](<https://github.com/enricodangelo/ptc_test/blob/master/out/diagrams/context/context.png?raw=true>
![alt text](https://github.com/enricodangelo/ptc_test/blob/master/out/../../../../../../../out/diagrams/FrontService/FrontService.png?raw=true)

