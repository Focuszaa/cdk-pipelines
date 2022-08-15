import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, InlineCode, Runtime } from 'aws-cdk-lib/aws-lambda';

export class MyLambdaStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
      super(scope, id, props);
  
      new Function(this, 'LambdaFunction', {
        runtime: Runtime.NODEJS_14_X,
        handler: 'index.handler',
        code: new InlineCode('exports.handler = _ => "Yes! we are here, this is deploying from CDK pipeline";')
      });
    }
}