# NOTIFICATION_ARN=--notification-arns=arn:aws:sns:us-east-1:892456250180:CloudFormation-all-events

install:
	#### Install dependencies for CDK-Pipeline stack ####
	npm ci;

	#### Install dependencies for authorizer function ####
	cd src/authorizer/; pwd; npm ci;

uninstall:
	#### Remove node_modules for CDK-Pipeline stack ####
	rm -rf node_modules;
	
	#### Remove node_modules for authorizer function ####
	cd src/authorizer/; rm -rf node_modules;

	#### Cache clean ####
	npm cache clean --force;

diff_canary:
	cdk diff canaryCdkPipelineStack;

diff_staging:
	cdk diff stagingCdkPipelineStack;

diff_production:
	cdk diff productionCdkPipelineStack;

deploy_canary:
	cdk deploy canaryCdkPipelineStack 

deploy_staging:
	cdk deploy stagingCdkPipelineStack 

deploy_production:
	cdk deploy productionCdkPipelineStack 
