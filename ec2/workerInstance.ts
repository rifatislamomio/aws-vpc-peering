import * as aws from "@pulumi/aws";
import * as dotenv from "dotenv";
import { vpcB, vpcBPrivateSubnetId } from "../vpc";

dotenv.config();

const workerServerSG = new aws.ec2.SecurityGroup("ec2-worker-sg", {
  vpcId: vpcB.id,
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
    Name: "ec2-worker-sg"
  }
});

const ec2KeyPair = new aws.ec2.KeyPair("ec2-key-pair-worker", {
  keyName: "ec2-key-pair-worker",
  publicKey: process.env.PUBLIC_KEY!
});

const workerInstance = new aws.ec2.Instance(
  "ec2-worker-instance",
  {
    instanceType: "t2.micro",
    ami: "ami-003c463c8207b4dfa", //Ubuntu, 24.04 LTS
    keyName: ec2KeyPair.keyName,
    vpcSecurityGroupIds: [workerServerSG.id],
    subnetId: vpcBPrivateSubnetId,
    tags: {
      Name: "ec2-worker-instance"
    }
  },
  {
    dependsOn: [vpcB, workerServerSG]
  }
);

export const workerInstanceId = workerInstance.id;
