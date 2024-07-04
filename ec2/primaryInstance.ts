import * as aws from "@pulumi/aws";
import * as dotenv from "dotenv";
import { vpcA, vpcAPrivateSubnetId } from "../vpc";

dotenv.config();

const primaryServerSG = new aws.ec2.SecurityGroup("ec2-primary-sg", {
  vpcId: vpcA.id,
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
    Name: "ec2-primary-sg"
  }
});

const ec2KeyPair = new aws.ec2.KeyPair("ec2-key-pair-primary", {
  keyName: "ec2-key-pair-primary",
  publicKey: process.env.PUBLIC_KEY!
});

const primaryInstance = new aws.ec2.Instance(
  "ec2-primary-instance",
  {
    instanceType: "t2.micro",
    ami: "ami-003c463c8207b4dfa", //Ubuntu, 24.04 LTS
    keyName: ec2KeyPair.keyName,
    vpcSecurityGroupIds: [primaryServerSG.id],
    subnetId: vpcAPrivateSubnetId,
    tags: {
      Name: "ec2-primary-instance"
    }
  },
  {
    dependsOn: [vpcA, primaryServerSG]
  }
);

export const primaryInstanceId = primaryInstance.id;

