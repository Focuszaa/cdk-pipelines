#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkPipelinesStack } from '../lib/cdk-pipelines-stack';

const app = new cdk.App();
new CdkPipelinesStack(app, 'CdkPipelinesStack', {
  env: {
    account: '892456250180',
    region: 'us-east-1',
  }
});

app.synth();