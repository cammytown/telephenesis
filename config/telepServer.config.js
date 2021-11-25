var ibm = require('ibm-cos-sdk');
//var cosCredentials = require('../.bluemix/cos_credentials');

module.exports = {
	sessionSecret: 'testerdoo',
	port: '8777',
	storage: {
		provider: 'ibm-cos',
		servingUrl: 'https://telep-art-2021-11.s3.us-east.cloud-object-storage.appdomain.cloud/',
		s3Config: {
			endpoint: 's3.us-east.cloud-object-storage.appdomain.cloud',
			apiKeyId: 'YijLqM3hWv4w7igEzrgybx11xX79IW1b14uF0KX8vUDi',
			serviceInstanceId: 'crn:v1:bluemix:public:cloud-object-storage:global:a/8cece4e8924b47e68a8ba0b7bdb9d0f9:ade1ff22-6c88-4007-8d4a-1acf8ba778ec:bucket:telep-art-2021-11',
			credentials: new ibm.SharedJSONFileCredentials({
				filename: './.bluemix/cos_credentials'
			}),
			signatureVersion: 'v4',
		}
	}
}
