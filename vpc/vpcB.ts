import * as aws from "@pulumi/aws";
import { vpcA } from "..";

const vpc = new aws.ec2.Vpc(
  "vpc-b",
  {
    cidrBlock: "20.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
      Name: "vpc-b"
    }
  },
  {
    dependsOn: [vpcA]
  }
);

export const vpcBId = vpc.id;
