import * as aws from "@pulumi/aws";
import * as dotenv from "dotenv";
import {
  vpcAId,
  vpcACidrBlock,
  vpcApublicSubnetId
} from "../vpc/vpcA";

dotenv.config();

const bastionServerSG = new aws.ec2.SecurityGroup("ec2-dev-bastion-sg", {
  vpcId: vpcAId,
  description: "Allowing SSH and HTTP only",
  ingress: [
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ["0.0.0.0/0"]
    },
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: ["0.0.0.0/0"]
    }
  ],
  egress: [
    {
      protocol: "-1", // Allow all protocols
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"]
    }
  ],
  tags: {
    Name: "ec2-bastion-sg"
  }
});

const ec2KeyPair = new aws.ec2.KeyPair("ec2-dev-kp", {
  keyName: "ec2-key-pair",
  publicKey: process.env.PUBLIC_KEY!
});

const bastionInstance = new aws.ec2.Instance("ec2-dev-bastion-instance", {
  instanceType: "t2.small",
  ami: "ami-04b70fa74e45c3917", //Ubuntu, 24.04 LTS
  keyName: ec2KeyPair.keyName,
  vpcSecurityGroupIds: [bastionServerSG.id],
  subnetId: vpcApublicSubnetId,
  tags: {
    Name: "ec2-dev-bastion-instance"
  }
});

export const bastionInstanceArn = bastionInstance.arn;
