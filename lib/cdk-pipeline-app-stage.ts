import * as cdk from 'aws-cdk-lib';
// import * as cdk from '@aws-cdk/core';
import { Construct } from "constructs";
import { MyLambdaStack } from './cdk-lambda-stack';
import { CustomDomainStack } from './cdk-custom-domain-stack';
import { HttpApi, HttpMethod, HttpStage } from '@aws-cdk/aws-apigatewayv2';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers';
import { getDefaultRole } from './cdk-custom-role';
import { Stack } from '@aws-cdk/core';


interface RemoteAppStageConstructorProps  extends cdk.StackProps {
  route53ZoneName: string
  stageName: string
  env?: cdk.Environment
}

export class AppStageRemoteProps implements cdk.StackProps {
  route53ZoneName;
  stageName;
  env;
  description;

  constructor({ stageName, route53ZoneName, env, description }: RemoteAppStageConstructorProps) {
    this.stageName = stageName;
    this.route53ZoneName = route53ZoneName;
    this.env = env;
    this.description = description;
  }
}

interface AuthFunction {
  handler: Function;
  authorizer: HttpLambdaAuthorizer;
}

export class MyPipelineAppStage extends cdk.Stage {
  private readonly customDomain?: CustomDomainStack;
  private readonly stage?: HttpStage;
  private readonly auth?: AuthFunction;

    constructor(scope: Construct, id: string, props: AppStageRemoteProps) {
      super(scope, id, props);
  
      const lambdaStack = new MyLambdaStack(this, 'LambdaStack');

      // const authorizerFnName = 'authorizer-fn';
      // const authorizerFnRole = getDefaultRole({
      //   functionName: `${this.stageName}-cdkpipeline-${authorizerFnName}`,
      //   parameterPath: ['cdk/*'],
      //   context: ,
      // });
    }
}