import { Effect, PolicyDocument, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Stack } from 'aws-cdk-lib';
import constants from './constants';

interface DefaultRoleProps {
  functionName: string;
  parameterPath?: Array<string>;
  context: Stack;
  isVpcFunction?: Boolean;
}

export function getDefaultRole(props: DefaultRoleProps) {
  const { AWS: { PROFILE } } = constants;

  let statements = [
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['xray:PutTraceSegments', 'xray:PutTelemetryRecords'],
      resources: ['*'],
    }),
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
      resources: [
        props.context.formatArn({
          service: 'logs',
          resource: 'log-group:',
          resourceName: `aws/lambda/${props.functionName}:*`,
        }),
      ],
    }),
  ];

  if (props.isVpcFunction) {
    statements.push(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'ec2:DescribeNetworkInterfaces',
          // Need to set resources to * due to CloudFormation does not pass network-interface in arn
          'ec2:DeleteNetworkInterface',
          'ec2:AssignPrivateIpAddresses',
          'ec2:UnassignPrivateIpAddresses'
        ],
        resources: ['*'],
      }),
    );

    statements.push(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ec2:CreateNetworkInterface'],
        resources: [
          props.context.formatArn({
            service: 'ec2',
            resource: 'subnet',
            resourceName: '*',
          }),
          props.context.formatArn({
            service: 'ec2',
            resource: 'security-group',
            resourceName: '*',
          }),
          props.context.formatArn({
            service: 'ec2',
            resource: 'network-interface',
            resourceName: '*',
          }),
        ],
      }),
    );
  }

  if (props.parameterPath) {
    const arnParameterPrefix: string = `arn:aws:ssm:${PROFILE.REGION}:${PROFILE.ACCOUNT}:parameter/`
    
    const arnResources = props.parameterPath.map(item => `${arnParameterPrefix}${item}`)

    statements.push(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ssm:GetParameter', 'ssm:GetParameters', 'ssm:GetParametersByPath'],
        resources: arnResources
      }),
    );
  }

  let policy = new PolicyDocument({ statements });

  const role = new Role(props.context, `custom-role-${props.functionName}`, {
    roleName: `${props.functionName}-role`,
    assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
    inlinePolicies: {
      defaultPolicy: policy,
    },
  });

  return role;
}
