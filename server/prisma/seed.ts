import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  // Clear out everything
  await prisma.review.deleteMany();
  await prisma.savedEvent.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizer.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();

  // ORGANIZATIONS
  const orgs = await Promise.all([
    prisma.organization.create({
      data: {
        name: "CSSA",
        description: "CS events",
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.organization.create({
      data: {
        name: "CSU",
        description: "Student Union",
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.organization.create({
      data: {
        name: "Athletics",
        description: "Sports Dept",
        isActive: true,
        updatedAt: new Date(),
      },
    }),
    prisma.organization.create({
      data: {
        name: "EngSoc",
        description: "Eng Society",
        isActive: true,
        updatedAt: new Date(),
      },
    }),
  ]);

  // USERS
  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@concordia.ca",
      password: hashedPassword,
      name: "Admin User",
      role: "ADMIN",
      updatedAt: new Date(),
    },
  });

  const organizer1 = await prisma.user.create({
    data: {
      email: "organizer1@concordia.ca",
      password: hashedPassword,
      name: "John Smith",
      role: "ORGANIZER",
      updatedAt: new Date(),
    },
  });

  const organizer2 = await prisma.user.create({
    data: {
      email: "organizer2@concordia.ca",
      password: hashedPassword,
      name: "Sarah Johnson",
      studentId: "ORG002",
      role: "ORGANIZER",
      updatedAt: new Date(),
    },
  });

  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: "student1@concordia.ca",
        password: hashedPassword,
        name: "Alice Brown",
        studentId: "40123456",
        role: "STUDENT",
        updatedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "student2@concordia.ca",
        password: hashedPassword,
        name: "Bob Wilson",
        studentId: "40234567",
        role: "STUDENT",
        updatedAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "student3@concordia.ca",
        password: hashedPassword,
        name: "Carol Davis",
        studentId: "40345678",
        role: "STUDENT",
        updatedAt: new Date(),
      },
    }),
  ]);

  // ORGANIZER PROFILES
  const organizerProfiles = await Promise.all([
    prisma.organizer.create({
      data: {
        name: "CSSA Events",
        email: "cssa@concordia.ca",
        phone: "123",
        department: "CS",
        isActive: true,
        organizationId: orgs[0].id,
      },
    }),
    prisma.organizer.create({
      data: {
        name: "CSU Events",
        email: "csu@concordia.ca",
        phone: "456",
        department: "Student Life",
        isActive: true,
        organizationId: orgs[1].id,
      },
    }),
    prisma.organizer.create({
      data: {
        name: "Athletics Events",
        email: "athletics@concordia.ca",
        phone: "789",
        department: "Athletics",
        isActive: true,
        organizationId: orgs[2].id,
      },
    }),
    prisma.organizer.create({
      data: {
        name: "EngSoc Events",
        email: "engsoc@concordia.ca",
        phone: "321",
        department: "Engineering",
        isActive: true,
        organizationId: orgs[3].id,
      },
    }),
  ]);

  // EVENTS
  const now = new Date();
  const events = await Promise.all([
    prisma.event.create({
      data: {
        title: "Hackathon",
        description: "Coding competition",
        date: new Date(now.getTime() + 604800000),
        location: "Building A",
        capacity: 100,
        ticketType: "FREE",
        status: "APPROVED",
        organizationId: orgs[0].id,
        organizerId: organizerProfiles[0].id,
        creatorId: organizer1.id,
        updatedAt: new Date(),
      },
    }),
    prisma.event.create({
      data: {
        title: "Welcome Week",
        description: "Orientation",
        date: new Date(now.getTime() + 86400000),
        location: "Building B",
        capacity: 200,
        ticketType: "FREE",
        status: "APPROVED",
        organizationId: orgs[1].id,
        organizerId: organizerProfiles[1].id,
        creatorId: organizer2.id,
        updatedAt: new Date(),
      },
    }),
    prisma.event.create({
      data: {
        title: "Basketball Finals",
        description: "Finals event",
        date: new Date(now.getTime() + 2592000000),
        location: "Gym",
        capacity: 150,
        ticketType: "PAID",
        ticketPrice: 15.99,
        status: "APPROVED",
        organizationId: orgs[2].id,
        organizerId: organizerProfiles[2].id,
        creatorId: organizer1.id,
        updatedAt: new Date(),
      },
    }),
  ]);

  // TICKETS
  await Promise.all([
    prisma.ticket.create({
      data: {
        qrCode: "QR-1",
        claimed: true,
        checkedIn: false,
        paymentStatus: "FREE",
        userId: students[0].id,
        eventId: events[0].id,
        updatedAt: new Date(),
      },
    }),
    prisma.ticket.create({
      data: {
        qrCode: "QR-2",
        claimed: true,
        checkedIn: true,
        paymentStatus: "FREE",
        userId: students[1].id,
        eventId: events[1].id,
        updatedAt: new Date(),
      },
    }),
    prisma.ticket.create({
      data: {
        qrCode: "QR-3",
        claimed: true,
        checkedIn: false,
        paymentStatus: "COMPLETED",
        paymentAmount: 15.99,
        userId: students[2].id,
        eventId: events[2].id,
        updatedAt: new Date(),
      },
    }),
  ]);

  // SAVED EVENTS
  await Promise.all([
    prisma.savedEvent.create({
      data: { userId: students[0].id, eventId: events[0].id },
    }),
    prisma.savedEvent.create({
      data: { userId: students[1].id, eventId: events[1].id },
    }),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

console.log("Seeding completed.");
