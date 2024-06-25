import * as aws from "@pulumi/aws";
import { vpcPeeringConnection as peeringConn } from "./vpcPeering";
import { vpcB } from "./vpcB";

const vpc = new aws.ec2.Vpc("vpc-a", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: {
    Name: "vpc-a"
  }
});

const publicSubnet = new aws.ec2.Subnet("vpca-public-subnet", {
  vpcId: vpc.id,
  cidrBlock: "10.0.1.0/24",
  availabilityZone: "us-east-1a",
  mapPublicIpOnLaunch: true,
  tags: {
    Name: "vpca-public-subnet"
  }
});

const igw = new aws.ec2.InternetGateway("vpca-igw", {
  vpcId: vpc.id,
  tags: {
    Name: "vpca-igw"
  }
});

const publicSubnetRouteTable = new aws.ec2.RouteTable(
  "vpc-pvt-subnet-rt",
  {
    vpcId: vpc.id,
    routes: [
      {
        cidrBlock: "10.0.0.0/16",
        localGatewayId: "local"
      },
      {
        cidrBlock: vpcB.cidrBlock,
        vpcPeeringConnectionId: peeringConn.id
      },
      {
        cidrBlock: "0.0.0.0/0",
        gatewayId: igw.id
      }
    ],
    tags: {
      Name: "vpca-public-subnet-rt"
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
  cidrBlock: "10.0.2.0/24",
  availabilityZone: "us-east-1a",
  tags: {
    Name: "vpca-private-subnet"
  }
});

const elasticIp = new aws.ec2.Eip("vpca-natgw-eip", {
  vpc: true,
  tags: {
    Name: "vpca-natgw-eip"
  }
});


const privateSubnetRT = new aws.ec2.RouteTable(
  "vpca-private-subnet-rt",
  {
    vpcId: vpc.id,
    routes: [
      {
        cidrBlock: "10.0.0.0/16",
        localGatewayId: "local"
      },
      {
        cidrBlock: vpcB.cidrBlock,
        vpcPeeringConnectionId: peeringConn.id
      }
    ],
    tags: {
      Name: "vpca-private-subnet-rt"
    }
  },
  {
    dependsOn: [peeringConn]
  }
);

const privateSubnetRTSubnetAssociation = new aws.ec2.RouteTableAssociation(
  "vpca-pvt-subnet-rt-association",
  {
    subnetId: privateSubnet.id,
    routeTableId: privateSubnetRT.id
  }
);

export const vpcAId = vpc.id;
export const vpcA = vpc;
export const vpcApublicSubnetId = publicSubnet.id;
export const vpcAprivateSubnetId = privateSubnet.id;
export const vpcACidrBlock = vpc.cidrBlock;