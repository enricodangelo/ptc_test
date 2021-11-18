# System Design and coding challenge

## Problem

A client is submitting jobs to an image processing worker farm running in the cloud. Write a modern scalable, resilient service with an api for accepting these jobs and query the status of these jobs.

The client will submit image data to your service. Your service will take this image data and create a backend "worker job object" and submit to an existing backend worker service. This worker service has an API located at `worker.cloud.net` (this can be mocked)
Worker Service API consists of 2 urls

- api/v1/job - you can submit a job here
- api/v1/job/\<id>/status - you can get job status here. This will return `RUNNING`,`SUCCESS`,`FAILED`

Use existing blob store - `worker.blob.net` to store binary payload (this can be mocked).
Blob service API consists of

- api/v1/blob - you can put a blob here
  - headers:
    - Content-Type : The MIME content type of the blob
    - Content-Length : The size of the content
- api/v1/blob/\<id> - you can get a blob here

Worker service will already have access and credentials to access data in the blob store.

## Challenge

Please design and build the system to solve the problem statement and build a Proof of Concept.
The PoC should be runnable and mocks/stubs can be use for external services.
Please highlight what additional work would need to be done to move your PoC to production code.

Details:

Client message calling your service will consist of:

- JWT bearer token in standard headers
  - claims {
    - tid = tenentId
    - oid = clientId
    - aud = audience
    - azp = appid
    - name = names
    - email = email
      }
- binary image data in json message
- json message
  {
  "encoding" : "base64",
  "MD5" : "\<checksum>"
  "content" : "\<binary-data>""
  }

Note : you can use <http://jwt.io> to encode/decode jwt tokens.

sample JWT

    eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ0aWQiOjEsIm9pZCI6MSwiYXVkIjoiY29tLmNvbXBhbnkuam9ic2VydmljZSIsImF6cCI6IjEiLCJlbWFpbCI6ImN1c3RvbWVyQG1haWwuY29tIn0.CcTapGbWX0UEMovUwC8kAcWMUxmbOeO0qhsu-wqHQH0

Service should:

- take the incoming message
- validate and verify the message
- Create a new Job object
- Add following information to job

  - tenentId
  - clientId
  - payload / payload location
  - payload size

- Please write service in a language of your choice
- Service should have api to submit job
- Service should have api to query jobs status
- Service should have api to get job results

Please share working example , code and design docs in your solution.
