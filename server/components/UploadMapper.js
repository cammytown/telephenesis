//const { S3Client, AbortMultipartUploadCommand } = require("@aws-sdk/client-s3");
const ibm = require('ibm-cos-sdk');
//var util = require('util');

const stars = require('./StarMapper');

const config = require('../telepServer.config');

//var s3 = new S3Client(config.storage.s3Config);
var s3 = new ibm.S3(config.storage.s3Config);


function doCreateBucket() {
	console.log('Creating bucket');
	return s3.createBucket({
		Bucket: 'my-bucket',
		CreateBucketConfiguration: {
			LocationConstraint: 'us-standard'
		},
	}).promise();
}

function doCreateObject() {
	console.log('Creating object');
	return s3.putObject({
		Bucket: 'my-bucket',
		Key: 'foo',
		Body: 'bar'
	}).promise();
}

function doDeleteObject() {
	console.log('Deleting object');
	return s3.deleteObject({
		Bucket: 'my-bucket',
		Key: 'foo'
	}).promise();
}

function doDeleteBucket() {
	console.log('Deleting bucket');
	return s3.deleteBucket({
		Bucket: 'my-bucket'
	}).promise();
}

function requestUploadURL(serverStar) {
	if(!serverStar.publicID) {
		throw "requestUploadURL(): no serverStar.publicID";
	}

	const params = {
		Bucket: 'telep-art-2021-11',
		Key: 'star-' + serverStar.publicID
	};

	return s3.getSignedUrlPromise('putObject', params);
}

//@TODO-1:
function TEMPoldLocalUploadCode() {
	var starFileName = "star" + newStarID;
	switch(multerFile.mimetype) {
		case 'audio/aiff':
		case 'audio/wav':
		{
			starFileName += '.mp3';

			const encoder = new Lame({
				"output": musicPath + starFileName,
				"bitrate": 256 //// 320?
			}).setFile('./' + multerFile.path);

			encoder.encode().then(() => {
				console.log('Encoding finished');
			}).catch((error) => {
				console.log(error);
				console.log('Something went wrong');
			});

		} break;

		case 'audio/mpeg':
		case 'audio/mp3': {
			starFileName += '.mp3';
			var target_path = musicPath + starFileName;
			fs.copyFile(multerFile.path, target_path, function(err) {
				if(err) {
					console.log(err);
					///
				}
			});
		} break;

		case 'audio/ogg': {
			/// convert?
			starFileName += '.ogg';
			var target_path = musicPath + starFileName;
			fs.copyFile(multerFile.path, target_path, function(err) {
				if(err) {
					console.log(err);
					///
				}
			});
		} break;

		default: {
			console.warn("WARNING: Didn't know what to do with file of mimetype " + multerFile.mimetype);
		}
	}
}

//doCreateBucket()
//    .then(doCreateObject)
//    .then(doDeleteObject)
//    .then(doDeleteBucket)
//    .then(function() {
//        console.log('Finished!');
//    })
//    .catch(function(err) {
//        console.error('An error occurred:');
//        console.error(util.inspect(err));
//    });

module.exports = {
	requestUploadURL
};

