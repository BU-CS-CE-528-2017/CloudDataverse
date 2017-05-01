# Cloud Dataverse

## Getting Started
Following this setup guide will get you a running CloudCompute UI for development or testing.

### Prerequisites
Node, NPM, MongoDB, Bower
```
apt-get update
apt-get install nodejs
apt-get install npm
npm install -g bower
```
For installing MongoDB, please refer to their official documentation:
[Installing Mongo on Ubuntu 16.04](https://docs.mongodb.com/v3.0/tutorial/install-mongodb-on-ubuntu/)

### Installing
Clone the CloudCompute UI repository to your instance

```
git clone https://github.com/BU-CS-CE-528-2017/CloudDataverse
```
Ensure MongoDB is running on your instance before continuing (refer to prior instructions if necessary) and you are in the CloudDataverse directory.

```
cd CloudDataverse/mean
npm install
node server.js
```
This will run CloudCompute locally on localhost port 3000 by default.

```
http://localhost:3000/
```
### Dataverse
Pull the Cloud Dataverse branch of Dataverse to your repository

```
git pull https://github.com/
```

For completing the Dataverse installation, please refer to their official documentation:
[Dataverse Installation] (http://guides.dataverse.org/en/latest/installation/)

## Use and Limitations

Assuming your Dataverse instance is correctly installed, you can begin uploading datasets for testing. Files are deposited to the Swift object store in your OpenStack project. Container names in Swift will match the dataset name in Dataverse.

Datasets from Dataverse are added to your 'compute batch' when the 'Add to Compute Batch' option is selected. Please note, multiple datasets can be added to your 'compute batch.' When ready, click the 'Compute Batch' button at the top of the page, this will redirect you to CloudCompute. Login with your OpenStack credentials and begin selecting your desired datasets.

At this time, CloudCompute only successfully completes jobs with Hadoop MapReduce. Additional work on our end is required before Spark and Storm will be operational with CloudCompute.

## Authors

* **Benjamin Corn** - [bencorn](https://github.com/bencorn)
* **Will Norman** - [willnorman](https://github.com/willnorman)
* **Sneha Pradhan** - [snehha](https://github.com/snehha)
* **Ang Li** - [Allegro-Leon-Li](https://github.com/Allegro-Leon-Li)
