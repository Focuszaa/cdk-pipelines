import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { MyLambdaStack } from "./cdk-lambda-stack";

interface RemoteAppStageConstructorProps extends cdk.StackProps {
	route53ZoneName: string;
	stageName: string;
	env?: cdk.Environment;
}

export class AppStageRemoteProps implements cdk.StackProps {
	route53ZoneName: string
  stageName: string
  env?: cdk.Environment

	constructor({
		stageName,
		route53ZoneName,
		env,
		
	}: RemoteAppStageConstructorProps) {
		this.stageName = stageName;
		this.route53ZoneName = route53ZoneName;
		this.env = env;
	}
}


export class MyPipelineAppStage extends cdk.Stage {
	

	constructor(scope: Construct, id: string, props: AppStageRemoteProps) {
		super(scope, id, props);

		const { route53ZoneName, stageName, env } = props;
		const lambdaStack = new MyLambdaStack(this, "LambdaStack", {
			route53ZoneName: route53ZoneName,
			stageName: stageName,
			env: env,
		});
	}
}
