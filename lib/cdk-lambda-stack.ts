import * as cdk from 'aws-cdk-lib';
 import { Construct } from 'constructs';
 import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
 import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { HttpApi, HttpStage, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { CustomDomainStack } from './cdk-custom-domain-stack';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { RemovalPolicy } from 'aws-cdk-lib';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { getDefaultRole } from './cdk-custom-role';

interface RemoteLambdaConstructorProps extends cdk.StackProps {
  route53ZoneName: string
  stageName: string
  env?: cdk.Environment
}

export class LambdaStageRemoteProps implements cdk.StackProps {
  route53ZoneName: string
  stageName: string
  env?: cdk.Environment

  constructor({ stageName, route53ZoneName, env, description }: RemoteLambdaConstructorProps) {
    this.stageName = stageName;
    this.route53ZoneName = route53ZoneName;
    this.env = env;
  }
}

interface AuthFunction {
  handler: Function;
  authorizer: HttpLambdaAuthorizer;
}

export class MyLambdaStack extends cdk.Stack {
  private readonly customDomain?: CustomDomainStack;
  private readonly stage?: HttpStage;
  private readonly auth?: AuthFunction;

  constructor(scope: Construct, id: string, props: LambdaStageRemoteProps) {
    super(scope, id, props);

    const { stageName } = props;

    if (props instanceof LambdaStageRemoteProps) {
      this.customDomain = new CustomDomainStack(this, 'Cert', {
        zoneName: props.route53ZoneName,
        recordName: stageName,
      });
    }

    const helloWorldFN = 'helloWorldFunction'
    const helloWorldFnRole = getDefaultRole({
      functionName: `${stageName}-cdkPipeline-${helloWorldFN}`,
      // parameterPath: ['cdk/*'],
      context: this,
    });

    const hello = new Function(this, 'HelloHandler', {
      functionName: helloWorldFN,
      role: helloWorldFnRole,
      runtime: Runtime.NODEJS_14_X,
      code: Code.fromAsset('src/app/hello-world'),
      handler: 'index.handler',
      timeout: cdk.Duration.seconds(5),
      memorySize: 128,
    });
    const helloWorldIntegration = new HttpLambdaIntegration('helloworldIntegration',hello)

    const authorizerFnName = 'authorizer-fn';
    const authorizerFnRole = getDefaultRole({
      functionName: `${stageName}-cdkPipeline-${authorizerFnName}`,
      parameterPath: ['cdk/*'],
      context: this,
    });

    const handler = new Function(this, 'AuthorizerFunction', {
      functionName: `${stageName}-cdkPipeline-${authorizerFnName}`,
      role: authorizerFnRole.withoutPolicyUpdates(),
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('src/authorizer'),
      timeout: cdk.Duration.seconds(60),
      logRetention: RetentionDays.ONE_WEEK,
      // tracing: Tracing.ACTIVE,
    });


    const authorizer = new HttpLambdaAuthorizer('lambdaAuthFuction', handler, {
      authorizerName: 'LambdaAuthorizer',
      responseTypes: [HttpLambdaResponseType.SIMPLE],
    });

    this.auth = {
      handler,
      authorizer,
    };

    const api = new HttpApi(this, 'API', {
      apiName: `cdkPipeline-${stageName}`,
      description: `cdkPipeline ${stageName}`,
      // createDefaultStage: !isRemote,
      disableExecuteApiEndpoint: true,
    });
    api.applyRemovalPolicy(RemovalPolicy.RETAIN)

    if (this.customDomain) {
      this.stage = api.addStage(stageName, {
        stageName: stageName,
        autoDeploy: true,
        domainMapping: {
          domainName: this.customDomain.apigwCustomDomainName,
        },
      });

      api.addRoutes({
        path: 'api/v1//hello-world',
        methods: [HttpMethod.GET],
        integration: helloWorldIntegration,
      });
    }
  }
}
