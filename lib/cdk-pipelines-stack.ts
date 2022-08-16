import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { MyPipelineAppStage, AppStageRemoteProps } from './cdk-pipeline-app-stage';
import constants from '../lib/constants';

interface RemoteConstructorProps  extends cdk.StackProps {
  route53ZoneName: string
  stageName: string
  env?: cdk.Environment
}

export class CdkPipelineStackRemoteProps implements cdk.StackProps {
  route53ZoneName;
  stageName;
  env;
  description;

  constructor({ stageName, route53ZoneName, env, description }: RemoteConstructorProps) {
    this.stageName = stageName;
    this.route53ZoneName = route53ZoneName;
    this.env = env;
    this.description = description;
  }
}

export class CdkPipelinesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CdkPipelineStackRemoteProps) {
    super(scope, id, props);

    const { GITHUB } = constants;

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'CdkPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.gitHub(`${GITHUB.OWNER}/${GITHUB.REPO}`, 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
      })
    });

    const AppStageProps = new AppStageRemoteProps({
      route53ZoneName: props.route53ZoneName,
      stageName: props.stageName,
      env: props.env,
    })

    pipeline.addStage(new MyPipelineAppStage(this, "lambdafuctions", AppStageProps));
  }
}