import * as aws from "@pulumi/aws";
import { vpcA } from "./vpcA";
import { vpcB } from "./vpcB";

export const vpcPeeringConn = new aws.ec2.VpcPeeringConnection(
  "vpcA-vpcB-peering-conn",
  {
    vpcId: vpcA.id,
    peerVpcId: vpcB.id,
    autoAccept: true,
    tags: {
      NAME: "vpcA-vpcB-peering-conn"
    }
  },
  {
    dependsOn: [vpcA, vpcB]
  }
);