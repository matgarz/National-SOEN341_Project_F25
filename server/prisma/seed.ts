
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed.');

  // Clear existing data
  await prisma.review.deleteMany();
  await prisma.savedEvent.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizer.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  //CREATE USERS
  const admin = await prisma.user.create({
    data: {
      email: 'admin@concordia.ca',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });

  const organizer1 = await prisma.user.create({
    data: {
      email: 'organizer1@concordia.ca',
      password: hashedPassword,
      name: 'John Smith',
      studentId: 'ORG001',
      role: 'ORGANIZER',
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      email: 'organizer2@concordia.ca',
      password: hashedPassword,
      name: 'Sarah Johnson',
      studentId: 'ORG002',
      role: 'ORGANIZER',
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'student1@concordia.ca',
        password: hashedPassword,
        name: 'Alice Brown',
        studentId: '40123456',
        role: 'STUDENT',
      },
    }),
    prisma.user.create({
      data: {
        email: 'student2@concordia.ca',
        password: hashedPassword,
        name: 'Bob Wilson',
        studentId: '40234567',
        role: 'STUDENT',
      },
    }),
    prisma.user.create({
      data: {
        email: 'student3@concordia.ca',
        password: hashedPassword,
        name: 'Carol Davis',
        studentId: '40345678',
        role: 'STUDENT',
      },
    }),
  ]);

  console.log('Created 6 users (1 admin, 2 organizers, 3 students)');

  //CREATE ORGANIZATIONS
  const orgs = await Promise.all([
    prisma.organization.create({
      data: {
        name: 'Computer Science Student Association',
        description: 'CSSA organizes tech talks, hackathons, and networking events for CS students.',
        contactEmail: 'cssa@concordia.ca',
        isActive: true,
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Concordia Student Union',
        description: 'CSU represents undergraduate students and organizes campus-wide events.',
        contactEmail: 'csu@concordia.ca',
        isActive: true,
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Athletics Department',
        description: 'Organizing sports events and competitions.',
        contactEmail: 'athletics@concordia.ca',
        isActive: true,
      },
    }),
    prisma.organization.create({
      data: {
        name: 'Engineering Society',
        description: 'Events for engineering students including workshops and social gatherings.',
        contactEmail: 'engsoc@concordia.ca',
        isActive: true,
      },
    }),
  ]);

  console.log('Created 4 organizations');

  const organizerProfiles = await Promise.all([
    prisma.organizer.create({
      data: {
        name: 'CSSA Events Team',
        email: 'cssa@concordia.ca',
        phone: '514-848-2424',
        website: 'https://cssa.concordia.ca',
        department: 'Computer Science',
        isActive: true,
        organizationId: orgs[0].id,
      },
    }),
    prisma.organizer.create({
      data: {
        name: 'CSU Events Team',
        email: 'csu@concordia.ca',
        phone: '514-848-7474',
        website: 'https://csu.concordia.ca',
        department: 'Student Life',
        isActive: true,
        organizationId: orgs[1].id,
      },
    }),
    prisma.organizer.create({
      data: {
        name: 'Athletics Events',
        email: 'athletics@concordia.ca',
        phone: '514-848-2424',
        department: 'Athletics',
        isActive: true,
        organizationId: orgs[2].id,
      },
    }),
    prisma.organizer.create({
      data: {
        name: 'EngSoc Events',
        email: 'engsoc@concordia.ca',
        phone: '514-848-3333',
        website: 'https://engsoc.concordia.ca',
        department: 'Engineering',
        isActive: true,
        organizationId: orgs[3].id,
      },
    }),
  ]);

  console.log('Created 4 organizer profiles');

  //CREATE EVENTS
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: 'Fall Hackathon 2025',
        description: '24-hour coding competition with prizes! Build innovative projects with your team.',
        date: nextWeek,
        location: 'EV Building, Room 2.260',
        capacity: 100,
        ticketType: 'FREE',
        category: 'Academic',
        status: 'APPROVED',
        organizationId: orgs[0].id,
        organizerId: organizerProfiles[0].id,
        creatorId: organizer1.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Welcome Week Orientation',
        description: 'Meet new friends, learn about campus life, and get your student ID!',
        date: tomorrow,
        location: 'Hall Building, Atrium',
        capacity: 200,
        ticketType: 'FREE',
        category: 'Social',
        status: 'APPROVED',
        organizationId: orgs[1].id,
        organizerId: organizerProfiles[1].id,
        creatorId: organizer2.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Basketball Championship Finals',
        description: 'Cheer for the Concordia Stingers in the championship game!',
        date: nextMonth,
        location: 'Concordia Gym',
        capacity: 150,
        ticketType: 'PAID',
        ticketPrice: 15.99,
        category: 'Sports',
        status: 'APPROVED',
        organizationId: orgs[2].id,
        organizerId: organizerProfiles[2].id,
        creatorId: organizer1.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Career Fair 2025',
        description: 'Meet top tech companies and explore internship opportunities.',
        date: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        location: 'MB Building, 9th Floor',
        capacity: 300,
        ticketType: 'FREE',
        category: 'Academic',
        status: 'APPROVED',
        organizationId: orgs[0].id,
        organizerId: organizerProfiles[0].id,
        creatorId: organizer1.id,
      },
    }),
    prisma.event.create({
      data: {
        title: 'Pizza Night & Movie Screening',
        description: 'Free pizza and watch a classic movie with fellow students!',
        date: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        location: 'H-110',
        capacity: 80,
        ticketType: 'FREE',
        category: 'Social',
        status: 'APPROVED',
        organizationId: orgs[1].id,
        organizerId: organizerProfiles[1].id,
        creatorId: organizer2.id,
      },
    }),
  ]);

  console.log('Created 5 events');

  //CREATE TICKETS
  await Promise.all([
    prisma.ticket.create({
      data: {
        qrCode: `QR-${Date.now()}-1`,
        claimed: true,
        checkedIn: false,
        paymentStatus: 'FREE',
        userId: students[0].id,
        eventId: events[0].id,
      },
    }),
    prisma.ticket.create({
      data: {
        qrCode: `QR-${Date.now()}-2`,
        claimed: true,
        checkedIn: true,
        paymentStatus: 'FREE',
        userId: students[1].id,
        eventId: events[1].id,
      },
    }),
    prisma.ticket.create({
      data: {
        qrCode: `QR-${Date.now()}-3`,
        claimed: true,
        checkedIn: false,
        paymentStatus: 'COMPLETED',
        paymentAmount: 15.99,
        userId: students[2].id,
        eventId: events[2].id,
      },
    }),
  ]);

  console.log('Created 3 sample tickets');

  //SAVE EVENTS
  await Promise.all([
    prisma.savedEvent.create({
      data: {
        userId: students[0].id,
        eventId: events[3].id,
      },
    }),
    prisma.savedEvent.create({
      data: {
        userId: students[1].id,
        eventId: events[4].id,
      },
    }),
  ]);

  console.log('Created 2 saved events');

  console.log('\n Database seed completed successfully!');
  console.log('\n Test Accounts (password: password123):');
  console.log('  Admin: admin@concordia.ca');
  console.log('  Organizer: organizer1@concordia.ca');
  console.log('  Student: student1@concordia.ca');
}

main()
  .catch((e) => {
    console.error(' Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });