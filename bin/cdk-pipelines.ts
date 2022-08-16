#!/usr/bin/env node
 import * as cdk from 'aws-cdk-lib';
// import * as cdk from '@aws-cdk/core';
import { CdkPipelinesStack, CdkPipelineStackRemoteProps } from '../lib/cdk-pipelines-stack';
import constants from '../lib/constants';

const app = new cdk.App();

const { AWS: {  PROFILE }, API } = constants;

console.log('Starting.....')
const revision = require('child_process').execSync('git rev-parse HEAD').toString().trim();

// prepare for using Dynamodb
// const DbTableStack = new TableStack(app, 'Db1Table', {
//   env: { account: PROFILE.ACCOUNT, region: PROFILE.REGION },
//   tableName: DYNAMODB_TABLES.DB1
// });

const defaultProps = new CdkPipelineStackRemoteProps({
  stageName: '',
  route53ZoneName: API.HOSTNAME,
  env: { account: PROFILE.ACCOUNT, region: PROFILE.REGION },
  description: `Git Revision: ${revision}`,
});
const canaryProps = new CdkPipelineStackRemoteProps({
  ...defaultProps,
  stageName: 'canary',
});
const stagingProps = new CdkPipelineStackRemoteProps({
  ...defaultProps,
  stageName: 'staging',
});
const productionProps = new CdkPipelineStackRemoteProps({
  ...defaultProps,
  stageName: 'production',
});

const canaryCdkPipelineStack      = new CdkPipelinesStack(app, 'canaryCdkPipelineStack', canaryProps);
const stagingCdkPipelineStack     = new CdkPipelinesStack(app, 'stagingCdkPipelineStack', stagingProps);
const productionCdkPipelineStack  = new CdkPipelinesStack(app, 'CdkPipelineStack', productionProps);

cdk.Tags.of(canaryCdkPipelineStack).add('environment', 'canary');
cdk.Tags.of(stagingCdkPipelineStack).add('environment', 'staging');
cdk.Tags.of(productionCdkPipelineStack).add('environment', 'production');


// new CdkPipelinesStack(app, 'CdkPipelinesStack', {
//   env: {
//     account: '892456250180',
//     region: 'us-east-1',
//   }
// });

app.synth();
