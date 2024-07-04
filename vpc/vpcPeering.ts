// import * as aws from "@pulumi/aws";
// import { vpcA, vpcAId } from "./vpcA";
// import { vpcB, vpcBId } from "./vpcB";

// export const vpcPeeringConnection = new aws.ec2.VpcPeeringConnection(
//   "vpcA-vpcB-peering-conn",
//   {
//     vpcId: vpcAId,
//     peerVpcId: vpcBId,
//     autoAccept: true,
//     tags: {
//       NAME: "vpcA-vpcB-peering-conn"
//     }
//   },
//   {
//     dependsOn: [vpcA, vpcB]
//   }
// );

// export const vpcPeeringId = vpcPeeringConnection.id;
// export const vpcPeeringUrn = vpcPeeringConnection.urn;
