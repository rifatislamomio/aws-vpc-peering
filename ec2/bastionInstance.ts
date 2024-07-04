import * as aws from "@pulumi/aws";
import * as dotenv from "dotenv";
import { vpcA, vpcApublicSubnetId } from "../vpc/vpcA";

dotenv.config();

const bastionServerSG = new aws.ec2.SecurityGroup("ec2-bastion-sg", {
  vpcId: vpcA.id,
  description: "Allowing SSH and HTTP only",
  ingress: [
    {
      protocol: "tcp",
      fromPort: 22,
      toPort: 22,
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

const ec2KeyPair = new aws.ec2.KeyPair("ec2-key-pair-bastion", {
  keyName: "ec2-key-pair-bastion",
  publicKey: process.env.PUBLIC_KEY!
});

const bastionInstance = new aws.ec2.Instance(
  "ec2-bastion-instance",
  {
    instanceType: "t2.micro",
    ami: "ami-003c463c8207b4dfa", //Ubuntu, 24.04 LTS (region: ap-southeast-1)
    keyName: ec2KeyPair.keyName,
    vpcSecurityGroupIds: [bastionServerSG.id],
    subnetId: vpcApublicSubnetId,
    tags: {
      Name: "ec2-bastion-instance"
    }
  },
  {
    dependsOn: [vpcA, bastionServerSG]
  }
);

export const bastionInstanceArn = bastionInstance.arn;
