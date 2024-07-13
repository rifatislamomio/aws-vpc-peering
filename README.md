# AWS VPC Peering
 
### Desciption: 
1. **Create two VPCs:**
   - Establish peering connection between them.
   - Create public and private subnets.
   - Create Internet and NAT gateways.
   - Create route tables and associatiate them with specefic subnets
2. **Create three EC2 instances (each in a separate VPC subnets)**:
    - Keep the bastion instance under public subnet.
    - Keep the primary and worker instance under private subnet of their specefic VPCs.

<br>
<p align="center">
  <img width="70%" align="center" src="./diagrams/vpc-peering.png" />
  <br>
  <em align="center">VPC Peering Connection</em>
</p>
<br>


3. **Configure Github Actions Workflow**:
   - Provide these following variables as Github Action's environment secrets:
     1. `AWS_ACCESS_KEY_ID`: Access key id from AWS of AWS IAM user
     2. `AWS_SECRET_ACCESS_KEY`: Secret access key of AWS IAM user
     
