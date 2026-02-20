import prisma from '../src/config/prisma';
import bcrypt from 'bcrypt';

async function main() {
  console.log('Starting database seed...');

  console.log('Creating users...');
  
  const managerPassword = await bcrypt.hash('securePassword123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {},
    create: {
      email: 'manager@example.com',
      password: managerPassword,
      firstName: 'System',
      lastName: 'Manager',
      role: 'MANAGER',
      isActive: true,
    },
  });

  const rawStockPassword = await bcrypt.hash('securePassword123', 10);
  const rawStockManager = await prisma.user.upsert({
    where: { email: 'stockmanager@example.com' },
    update: {},
    create: {
      email: 'stockmanager@example.com',
      password: rawStockPassword,
      firstName: 'Raw Stock',
      lastName: 'Manager',
      role: 'RAW_STOCK_MANAGER',
      isActive: true,
    },
  });

  const productionPassword = await bcrypt.hash('securePassword123', 10);
  const productionClient = await prisma.user.upsert({
    where: { email: 'production@example.com' },
    update: {},
    create: {
      email: 'production@example.com',
      password: productionPassword,
      firstName: 'Production',
      lastName: 'Client',
      role: 'PRODUCTION_CLIENT',
      isActive: true,
    },
  });

  const distributorPassword = await bcrypt.hash('securePassword123', 10);
  const distributor = await prisma.user.upsert({
    where: { email: 'distributor@example.com' },
    update: {},
    create: {
      email: 'distributor@example.com',
      password: distributorPassword,
      firstName: 'Main',
      lastName: 'Distributor',
      role: 'DISTRIBUTOR',
      isActive: true,
    },
  });

  const transportPassword = await bcrypt.hash('securePassword123', 10);
  const transportUser = await prisma.user.upsert({
    where: { email: 'transport@example.com' },
    update: {},
    create: {
      email: 'transport@example.com',
      password: transportPassword,
      firstName: 'Fast',
      lastName: 'Transport',
      role: 'TRANSPORT_PROVIDER',
      isActive: true,
    },
  });

  console.log('✅ Users created');

  console.log('Creating locations...');

  const rawWarehouse = await prisma.location.upsert({
    where: { id: 'raw-warehouse-1' },
    update: {},
    create: {
      id: 'raw-warehouse-1',
      name: 'Main Raw Materials Warehouse',
      address: '123 Warehouse St, Industrial Zone',
      latitude: 40.7128,
      longitude: -74.006,
      locationType: 'RAW_WAREHOUSE',
      userId: rawStockManager.id,
    },
  });

  const productionFacility = await prisma.location.upsert({
    where: { id: 'production-facility-1' },
    update: {},
    create: {
      id: 'production-facility-1',
      name: 'Main Production Facility',
      address: '456 Factory Rd, Industrial Park',
      latitude: 40.7589,
      longitude: -73.9851,
      locationType: 'PRODUCTION_FACILITY',
      userId: productionClient.id,
    },
  });

  const distributionCenter = await prisma.location.upsert({
    where: { id: 'distribution-center-1' },
    update: {},
    create: {
      id: 'distribution-center-1',
      name: 'Central Distribution Center',
      address: '789 Distribution Ave, Commerce District',
      latitude: 40.7306,
      longitude: -73.9352,
      locationType: 'DISTRIBUTION_CENTER',
      userId: distributor.id,
    },
  });

  console.log('✅ Locations created');

  console.log('Creating products...');

  const steelRod = await prisma.product.upsert({
    where: { sku: 'RAW-STEEL-001' },
    update: {},
    create: {
      name: 'Steel Rod',
      description: 'High-grade steel rod for manufacturing',
      sku: 'RAW-STEEL-001',
      type: 'RAW_MATERIAL',
      unitWeight: 5.0,
      isActive: true,
    },
  });

  const plasticPellets = await prisma.product.upsert({
    where: { sku: 'RAW-PLASTIC-001' },
    update: {},
    create: {
      name: 'Plastic Pellets',
      description: 'Recyclable plastic pellets',
      sku: 'RAW-PLASTIC-001',
      type: 'RAW_MATERIAL',
      unitWeight: 1.0,
      isActive: true,
    },
  });

  const finishedWidget = await prisma.product.upsert({
    where: { sku: 'FIN-WIDGET-001' },
    update: {},
    create: {
      name: 'Industrial Widget',
      description: 'High-quality industrial widget',
      sku: 'FIN-WIDGET-001',
      type: 'FINISHED_PRODUCT',
      unitWeight: 3.0,
      isActive: true,
    },
  });

  const finishedGadget = await prisma.product.upsert({
    where: { sku: 'FIN-GADGET-001' },
    update: {},
    create: {
      name: 'Consumer Gadget',
      description: 'Popular consumer gadget',
      sku: 'FIN-GADGET-001',
      type: 'FINISHED_PRODUCT',
      unitWeight: 0.5,
      isActive: true,
    },
  });

  console.log('✅ Products created');

  console.log('Creating initial stock...');

  await prisma.rawMaterialStock.upsert({
    where: {
      productId_locationId: {
        productId: steelRod.id,
        locationId: rawWarehouse.id,
      },
    },
    update: {},
    create: {
      productId: steelRod.id,
      locationId: rawWarehouse.id,
      quantity: 1000,
      reservedQty: 0,
      availableQty: 1000,
    },
  });

  await prisma.rawMaterialStock.upsert({
    where: {
      productId_locationId: {
        productId: plasticPellets.id,
        locationId: rawWarehouse.id,
      },
    },
    update: {},
    create: {
      productId: plasticPellets.id,
      locationId: rawWarehouse.id,
      quantity: 5000,
      reservedQty: 0,
      availableQty: 5000,
    },
  });

  console.log('✅ Stock created');

  console.log('Creating transport provider...');

  const transportProvider = await prisma.transportProvider.upsert({
    where: { userId: transportUser.id },
    update: {},
    create: {
      name: 'Fast Transport Co.',
      userId: transportUser.id,
      isActive: true,
    },
  });

  await prisma.vehicle.upsert({
    where: { licensePlate: 'TRUCK-001' },
    update: {},
    create: {
      providerId: transportProvider.id,
      name: 'Heavy Truck 1',
      licensePlate: 'TRUCK-001',
      capacityKg: 5000,
      costPerKm: 2.5,
      status: 'AVAILABLE',
    },
  });

  await prisma.vehicle.upsert({
    where: { licensePlate: 'VAN-001' },
    update: {},
    create: {
      providerId: transportProvider.id,
      name: 'Delivery Van 1',
      licensePlate: 'VAN-001',
      capacityKg: 1000,
      costPerKm: 1.0,
      status: 'AVAILABLE',
    },
  });

  console.log('✅ Transport provider and vehicles created');

  console.log('\n='.repeat(50));
  console.log('✅ Database seeded successfully!');
  console.log('='.repeat(50));
  console.log('\nTest Accounts:');
  console.log('Manager: manager@logistics.com / manager123');
  console.log('Raw Stock Manager: rawstock@logistics.com / stock123');
  console.log('Production Client: production@logistics.com / production123');
  console.log('Distributor: distributor@logistics.com / distributor123');
  console.log('Transport Provider: transport@logistics.com / transport123');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
