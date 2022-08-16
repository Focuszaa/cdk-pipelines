import { DomainName } from '@aws-cdk/aws-apigatewayv2';
import { Certificate, CertificateValidation } from '@aws-cdk/aws-certificatemanager';
import { HostedZone, IHostedZone, RecordSet, RecordTarget, RecordType } from '@aws-cdk/aws-route53';
import * as cdk from '@aws-cdk/core';

interface CustomDomainStackProps extends cdk.NestedStackProps {
  zoneName: string;
  recordName: string;
}

export class CustomDomainStack extends cdk.NestedStack {
  public readonly cert: Certificate;
  public readonly zone: IHostedZone;
  public readonly apigwCustomDomainName: DomainName;

  constructor(scope: cdk.Construct, id: string, props: CustomDomainStackProps) {
    super(scope, id, props);

    const { zoneName, recordName } = props;
    const customDomain = recordName === 'production' ? zoneName : `${recordName}.${zoneName}`;

    this.zone = HostedZone.fromLookup(this, 'Zone', {
      domainName: zoneName,
    });

    if (zoneName === 'orcarlabs.com') {
      this.cert = new Certificate(this, 'CdkLabsCertificate', {
        domainName: customDomain,
        validation: CertificateValidation.fromDns(this.zone),
      });

      this.apigwCustomDomainName = new DomainName(this, 'DomainName', {
        domainName: customDomain,
        certificate: this.cert,
      });

      new cdk.CfnOutput(this, 'CDK Labs Custom Domain Name', {
        value: this.apigwCustomDomainName.regionalDomainName,
      });

      new cdk.CfnOutput(this, 'CDK Labs Custom Domain Hosted Zone ID', {
        value: this.apigwCustomDomainName.regionalHostedZoneId,
      });

      new cdk.CfnOutput(this, 'CDK Labs Certificate Arn', {
        value: this.cert.certificateArn,
      });

      new RecordSet(this, 'RecordSet', {
        zone: this.zone,
        recordName: recordName === 'production' ? undefined : recordName,
        recordType: recordName === 'production' ? RecordType.A : RecordType.CNAME,
        target:
          recordName === 'production'
            ? RecordTarget.fromIpAddresses('xxx.xx.xx.x', 'xxx.xxx.xxx.xx')  // need to be check and fix 
            : RecordTarget.fromValues(`${customDomain}.cdn.cloudflare.net.`),  
        ttl: cdk.Duration.minutes(10),
      });
    } 
  }
}
