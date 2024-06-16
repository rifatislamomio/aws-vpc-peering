import * as aws from "@pulumi/aws";
import { vpcBId } from "./vpc/vpcB";

const vpc = new aws.ec2.Vpc("vpc-a", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: {
    Name: "vpc-a"
  }
});

const vpcPeeringConn = new aws.ec2.VpcPeeringConnection(
  "vpcA-vpcB-peering-conn",
  {
    vpcId: vpc.id,
    peerVpcId: vpcBId,
    autoAccept: true,
    tags: {
      NAME: "vpcA-vpcB-peering-conn"
    }
  },
  {
    dependsOn: [vpc, ] //TODO
  }
);

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

const publicSubnetRouteTable = new aws.ec2.RouteTable("vpc-pvt-subnet-rt", {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: "10.0.0.0/16",
      localGatewayId: "local"
    },
    {
      cidrBlock: "0.0.0.0/0",
      gatewayId: igw.id
    }
  ],
  tags: {
    Name: "vpc-public-subnet-rt"
  }
});

const publicSubnetRTAssociation = new aws.ec2.RouteTableAssociation(
  "vpc-pub-subnet-rt-association",
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

const natGW = new aws.ec2.NatGateway("vpca-nat-gw", {
  subnetId: publicSubnet.id,
  connectivityType: "public",
  allocationId: elasticIp.allocationId,
  tags: {
    Name: "vpca-nat-gw"
  }
});

const privateSubnetRT = new aws.ec2.RouteTable("vpc-private-subnet-rt", {
  vpcId: vpc.id,
  routes: [
    {
      cidrBlock: "10.0.0.0/16",
      localGatewayId: "local"
    },
    {
      cidrBlock: "0.0.0.0/0",
      natGatewayId: natGW.id
    }
  ],
  tags: {
    Name: "vpc-private-subnet-rt"
  }
});

const privateSubnetRTSubnetAssociation = new aws.ec2.RouteTableAssociation(
  "vpca-pvt-subnet-rt-association",
  {
    subnetId: privateSubnet.id,
    routeTableId: privateSubnetRT.id
  }
);

export const vpcAId = vpc.id;
export const vpcA = vpc;
export const vpcACidrBlock = vpc.cidrBlock;
export const vpcApublicSubnetId = publicSubnet.id;
export const vpcAprivateSubnetId = privateSubnet.id;
export const peeringID = vpcPeeringConn.id;
