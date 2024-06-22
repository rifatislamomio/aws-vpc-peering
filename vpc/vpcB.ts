import * as aws from "@pulumi/aws";
import { vpcA } from "./vpcA";
import { vpcPeeringConnection as peeringConn } from "./vpcPeering";

const vpc = new aws.ec2.Vpc(
  "vpc-b",
  {
    cidrBlock: "20.0.0.0/16",
    enableDnsHostnames: true,
    enableDnsSupport: true,
    tags: {
      Name: "vpc-b"
    }
  }
);

const publicSubnet = new aws.ec2.Subnet("vpcb-public-subnet", {
  vpcId: vpc.id,
  cidrBlock: "20.0.1.0/28",
  availabilityZone: "us-east-1a",
  mapPublicIpOnLaunch: true,
  tags: {
    Name: "vpcb-public-subnet"
  }
});

const igw = new aws.ec2.InternetGateway("vpcb-igw", {
  vpcId: vpc.id,
  tags: {
    Name: "vpcb-igw"
  }
});

const publicSubnetRouteTable = new aws.ec2.RouteTable(
  "vpc-pvt-subnet-rt",
  {
    vpcId: vpc.id,
    routes: [
      {
        cidrBlock: vpc.cidrBlock,
        localGatewayId: "local"
      },
      {
        cidrBlock: vpcA.cidrBlock,
        vpcPeeringConnectionId: peeringConn.id
      },
      {
        cidrBlock: "0.0.0.0/0",
        gatewayId: igw.id
      }
    ],
    tags: {
      Name: "vpcb-public-subnet-rt"
    }
  },
  {
    dependsOn: [igw, peeringConn]
  }
);

const publicSubnetRTAssociation = new aws.ec2.RouteTableAssociation(
  "vpca-pub-subnet-rt-association",
  {
    subnetId: publicSubnet.id,
    routeTableId: publicSubnetRouteTable.id
  }
);

const privateSubnet = new aws.ec2.Subnet("vpca-private-subnet", {
  vpcId: vpc.id,
  cidrBlock: "20.0.2.0/28",
  availabilityZone: "us-east-1a",
  tags: {
    Name: "vpcb-private-subnet"
  }
});

const elasticIp = new aws.ec2.Eip("vpcb-natgw-eip", {
  vpc: true,
  tags: {
    Name: "vpcb-natgw-eip"
  }
});


const natGW = new aws.ec2.NatGateway("vpcb-nat-gw", {
  subnetId: publicSubnet.id,
  connectivityType: "public",
  allocationId: elasticIp.allocationId,
  tags: {
    Name: "vpcb-nat-gw"
  }
});

const privateSubnetRT = new aws.ec2.RouteTable(
  "vpcb-private-subnet-rt",
  {
    vpcId: vpc.id,
    routes: [
      {
        cidrBlock: vpc.cidrBlock,
        localGatewayId: "local"
      },
      {
        cidrBlock: vpcA.cidrBlock,
        vpcPeeringConnectionId: peeringConn.id
      },
      {
        cidrBlock: "0.0.0.0/0",
        natGatewayId: natGW.id
      }
    ],
    tags: {
      Name: "vpcb-private-subnet-rt"
    }
  },
  {
    dependsOn: [natGW, peeringConn]
  }
);

const privateSubnetRTSubnetAssociation = new aws.ec2.RouteTableAssociation(
  "vpcb-pvt-subnet-rt-association",
  {
    subnetId: privateSubnet.id,
    routeTableId: privateSubnetRT.id
  }
);

export const vpcBId = vpc.id;
export const vpcB = vpc;
export const vpcBpublicSubnetId = publicSubnet.id;
export const vpcBprivateSubnetId = privateSubnet.id;
