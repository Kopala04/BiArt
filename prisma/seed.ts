import "dotenv/config";
import bcrypt from "bcryptjs";
import { createPrismaClient } from "../src/lib/prisma";

const prisma = createPrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 12);
  const clientPassword = await bcrypt.hash("client123", 12);

  await prisma.user.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.package.deleteMany();
  await prisma.service.deleteMany();
  await prisma.mediaItem.deleteMany();
  await prisma.contactMessage.deleteMany();

  const packages = await Promise.all([
    prisma.package.create({
      data: {
        name: "Starter Pack",
        slug: "starter-pack",
        price: 499,
        description:
          "Perfect for small businesses taking their first step into professional advertising.",
        services: JSON.stringify([
          "Free B2B consultation (30 min)",
          "Business card design",
          "Basic social media banner",
          "1 revision round",
        ]),
        featured: false,
        sortOrder: 1,
      },
    }),
    prisma.package.create({
      data: {
        name: "Standard Pack",
        slug: "standard-pack",
        price: 1299,
        description:
          "Our most popular package for growing businesses that need a cohesive brand presence.",
        services: JSON.stringify([
          "Extended B2B consultation (60 min)",
          "Business card design & printing (500 units)",
          "Banner design (3 sizes)",
          "Basic branding guidelines",
          "Social media ad creatives (5)",
          "2 revision rounds",
        ]),
        featured: true,
        sortOrder: 2,
      },
    }),
    prisma.package.create({
      data: {
        name: "Premium Pack",
        slug: "premium-pack",
        price: 2999,
        description:
          "Complete advertising solution for established businesses ready to dominate their market.",
        services: JSON.stringify([
          "Premium B2B strategy session",
          "Full branding package",
          "Business cards & print materials",
          "Multi-platform banner suite",
          "Social media campaign (30 days)",
          "Professional photo/video shoot (4 hrs)",
          "Dedicated account manager",
          "Unlimited revisions",
        ]),
        featured: false,
        sortOrder: 3,
      },
    }),
  ]);

  await prisma.user.create({
    data: {
      email: "admin@biart.com",
      passwordHash: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "client@example.com",
      passwordHash: clientPassword,
      name: "John Smith",
      company: "Smith Enterprises",
      phone: "+1 (555) 987-6543",
      role: "B_USER",
      activePackageId: packages[1].id,
    },
  });

  const services = [
    {
      title: "Free B2B Consultations",
      slug: "b2b-consultations",
      description:
        "Expert guidance to identify your advertising needs and create a tailored strategy for your business growth.",
      icon: "MessageSquare",
      price: 0,
      bookable: true,
      featured: true,
      sortOrder: 1,
    },
    {
      title: "Business Card Design & Printing",
      slug: "business-cards",
      description:
        "Professional business card design with premium printing options that leave a lasting first impression.",
      icon: "CreditCard",
      price: 89,
      bookable: true,
      featured: true,
      sortOrder: 2,
    },
    {
      title: "Banner Design",
      slug: "banner-design",
      description:
        "Eye-catching banners for digital and print media, optimized for maximum visibility and impact.",
      icon: "Layout",
      price: 149,
      bookable: true,
      featured: true,
      sortOrder: 3,
    },
    {
      title: "Branding Services",
      slug: "branding",
      description:
        "Complete brand identity development including logos, color palettes, typography, and brand guidelines.",
      icon: "Palette",
      price: 349,
      bookable: true,
      featured: true,
      sortOrder: 4,
    },
    {
      title: "Social Media Advertising",
      slug: "social-media",
      description:
        "Targeted social media campaigns across all major platforms to reach your ideal customers.",
      icon: "Share2",
      price: 199,
      bookable: true,
      featured: true,
      sortOrder: 5,
    },
    {
      title: "Video & Photo Production",
      slug: "media-production",
      description:
        "High-quality video and photography for commercials, product shoots, events, and digital content.",
      icon: "Camera",
      price: 499,
      bookable: true,
      featured: true,
      sortOrder: 6,
    },
    {
      title: "Custom Services",
      slug: "custom-services",
      description:
        "Tailored advertising solutions designed specifically for your unique business requirements.",
      icon: "Sparkles",
      price: null,
      bookable: false,
      featured: false,
      sortOrder: 7,
    },
  ];

  for (const service of services) {
    await prisma.service.create({ data: service });
  }

  const mediaItems = [
    {
      title: "Tech Startup Launch Campaign",
      description: "Full digital campaign for a SaaS product launch",
      category: "CAMPAIGNS" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
      tags: "campaign,digital,startup",
      featured: true,
      sortOrder: 1,
    },
    {
      title: "Luxury Brand Photography",
      description: "Product photography for a premium fashion brand",
      category: "PHOTOGRAPHY" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
      tags: "photography,fashion,luxury",
      featured: true,
      sortOrder: 2,
    },
    {
      title: "Corporate Brand Video",
      description: "Brand story video for a Fortune 500 company",
      category: "VIDEO" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80",
      tags: "video,corporate,brand",
      featured: true,
      sortOrder: 3,
    },
    {
      title: "Restaurant Rebrand",
      description: "Complete visual identity overhaul for a restaurant chain",
      category: "BRANDING" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
      tags: "branding,restaurant,identity",
      featured: false,
      sortOrder: 4,
    },
    {
      title: "E-commerce Product Shoot",
      description: "Studio photography for an online retail catalog",
      category: "PHOTOGRAPHY" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      tags: "photography,ecommerce,product",
      featured: false,
      sortOrder: 5,
    },
    {
      title: "Social Media Ad Series",
      description: "Multi-platform ad campaign for a fitness brand",
      category: "CAMPAIGNS" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=400&q=80",
      tags: "campaign,social,fitness",
      featured: false,
      sortOrder: 6,
    },
  ];

  for (const item of mediaItems) {
    await prisma.mediaItem.create({ data: item });
  }

  console.log("Seed completed successfully");
  console.log("Admin: admin@biart.com / admin123");
  console.log("Client: client@example.com / client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
