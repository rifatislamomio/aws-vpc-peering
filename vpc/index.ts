import * as aws from "@pulumi/aws";

export const vpcA = new aws.ec2.Vpc("vpc-a", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: {
    Name: "vpc-a"
  }
});

export const vpcB = new aws.ec2.Vpc("vpc-b", {
  cidrBlock: "20.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: {
    Name: "vpc-b"
  }
});

const vpcAPublicSubnet = new aws.ec2.Subnet(
  "vpca-public-subnet",
  {
    vpcId: vpcA.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "ap-southeast-1a",
    mapPublicIpOnLaunch: true,
    tags: {
      Name: "vpca-public-subnet"
    }
  },
  {
    dependsOn: [vpcA]
  }
);

const vpcAPrivateSubnet = new aws.ec2.Subnet(
  "vpca-private-subnet",
  {
    vpcId: vpcA.id,
    cidrBlock: "10.0.2.0/24",
    availabilityZone: "ap-southeast-1a",
    tags: {
      Name: "vpca-private-subnet"
    }
  },
  {
    dependsOn: [vpcA]
  }
);

const vpcBPublicSubnet = new aws.ec2.Subnet(
  "vpcb-public-subnet",
  {
    vpcId: vpcB.id,
    cidrBlock: "20.0.1.0/28",
    availabilityZone: "ap-southeast-1a",
    mapPublicIpOnLaunch: true,
    tags: {
      Name: "vpcb-public-subnet"
    }
  },
  {
    dependsOn: [vpcB]
  }
);

const vpcBPrivateSubnet = new aws.ec2.Subnet(
  "vpcb-private-subnet",
  {
    vpcId: vpcB.id,
    cidrBlock: "20.0.2.0/28",
    availabilityZone: "ap-southeast-1a",
    tags: {
      Name: "vpcb-private-subnet"
    }
  },
  {
    dependsOn: [vpcB]
  }
);

const vpcAIgw = new aws.ec2.InternetGateway("vpca-igw", {
  vpcId: vpcA.id,
  tags: {
    Name: "vpca-igw"
  }
});

const vpcBIgw = new aws.ec2.InternetGateway("vpcb-igw", {
  vpcId: vpcB.id,
  tags: {
    Name: "vpcb-igw"
  }
});

const vpcPeeringConnection = new aws.ec2.VpcPeeringConnection(
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

const vpcAPublicSubnetRouteTable = new aws.ec2.RouteTable(
  "vpca-pvt-subnet-rt",
  {
    vpcId: vpcA.id,
    routes: [
      {
        cidrBlock: vpcA.cidrBlock,
        localGatewayId: "local"
      },
      {
        cidrBlock: "20.0.0.0/16",
        vpcPeeringConnectionId: vpcPeeringConnection.id
      },
      {
        cidrBlock: "0.0.0.0/0",
        gatewayId: vpcAIgw.id
      }
    ],
    tags: {
      Name: "vpca-public-subnet-rt"
    }
  },
  {
    dependsOn: [vpcA, vpcAIgw, vpcPeeringConnection]
  }
);

const vpcAPrivateSubnetRT = new aws.ec2.RouteTable(
  "vpca-private-subnet-rt",
  {
    vpcId: vpcA.id,
    routes: [
      {
        cidrBlock: "10.0.0.0/16",
        localGatewayId: "local"
      },
      {
        cidrBlock: "20.0.0.0/16",
        vpcPeeringConnectionId: vpcPeeringConnection.id
      }
    ],
    tags: {
      Name: "vpca-private-subnet-rt"
    }
  },
  {
    dependsOn: [vpcA, vpcPeeringConnection]
  }
);

new aws.ec2.RouteTableAssociation("vpca-pub-subnet-rt-association", {
  subnetId: vpcAPublicSubnet.id,
  routeTableId: vpcAPublicSubnetRouteTable.id
});

new aws.ec2.RouteTableAssociation("vpca-pvt-subnet-rt-association", {
  subnetId: vpcAPrivateSubnet.id,
  routeTableId: vpcAPrivateSubnetRT.id
});

const vpcBElasticIp = new aws.ec2.Eip("vpcb-natgw-eip", {
  vpc: true,
  tags: {
    Name: "vpcb-natgw-eip"
  }
});

const vpcBNatGW = new aws.ec2.NatGateway("vpcb-nat-gw", {
  subnetId: vpcBPublicSubnet.id,
  connectivityType: "public",
  allocationId: vpcBElasticIp.allocationId,
  tags: {
    Name: "vpcb-nat-gw"
  }
});

const vpcBPublicSubnetRouteTable = new aws.ec2.RouteTable(
  "vpcb-pvt-subnet-rt",
  {
    vpcId: vpcB.id,
    routes: [
      {
        cidrBlock: vpcB.cidrBlock,
        localGatewayId: "local"
      },
      {
        cidrBlock: "10.0.0.0/16",
        vpcPeeringConnectionId: vpcPeeringConnection.id
      },
      {
        cidrBlock: "0.0.0.0/0",
        gatewayId: vpcBIgw.id
      }
    ],
    tags: {
      Name: "vpcb-public-subnet-rt"
    }
  },
  {
    dependsOn: [vpcB, vpcBIgw, vpcPeeringConnection]
  }
);

const vpcBPrivateSubnetRT = new aws.ec2.RouteTable(
  "vpcb-private-subnet-rt",
  {
    vpcId: vpcB.id,
    routes: [
      {
        cidrBlock: "20.0.0.0/16",
        localGatewayId: "local"
      },
      {
        cidrBlock: "10.0.0.0/16",
        vpcPeeringConnectionId: vpcPeeringConnection.id
      },
      {
        cidrBlock: "0.0.0.0/0",
        gatewayId: vpcBNatGW.id
      }
    ],
    tags: {
      Name: "vpcb-private-subnet-rt"
    }
  },
  {
    dependsOn: [vpcBNatGW, vpcPeeringConnection]
  }
);

new aws.ec2.RouteTableAssociation("vpcb-pub-subnet-rt-association", {
  subnetId: vpcBPublicSubnet.id,
  routeTableId: vpcBPublicSubnetRouteTable.id
});

new aws.ec2.RouteTableAssociation("vpcb-pvt-subnet-rt-association", {
  subnetId: vpcBPrivateSubnet.id,
  routeTableId: vpcBPrivateSubnetRT.id
});

export const vpcAId = vpcA.id;
export const vpcBId = vpcB.id;
export const vpcAPublicSubnetId = vpcAPublicSubnet.id;
export const vpcAPrivateSubnetId = vpcAPrivateSubnet.id;
export const vpcBPublicSubnetId = vpcBPublicSubnet.id;
export const vpcBPrivateSubnetId = vpcBPrivateSubnet.id;
