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
        name: "საწყისი პაკეტი",
        slug: "starter-pack",
        price: 499,
        description:
          "იდეალურია მცირე ბიზნესისთვის, რომელიც პროფესიონალურ რეკლამაში პირველ ნაბიჯს დგამს.",
        services: JSON.stringify([
          "უფასო B2B კონსულტაცია (30 წთ)",
          "სავიზიტო ბარათის დიზაინი",
          "ძირითადი სოციალური მედიის ბანერი",
          "1 რევიზიის რაუნდი",
        ]),
        featured: false,
        sortOrder: 1,
      },
    }),
    prisma.package.create({
      data: {
        name: "სტანდარტული პაკეტი",
        slug: "standard-pack",
        price: 1299,
        description:
          "ჩვენი ყველაზე პოპულარული პაკეტი მზარდი ბიზნესისთვის, რომელსაც ერთიანი ბრენდის წარმოჩენა სჭირდება.",
        services: JSON.stringify([
          "გაფართოებული B2B კონსულტაცია (60 წთ)",
          "სავიზიტო ბარათის დიზაინი და ბეჭდვა (500 ერთეული)",
          "ბანერის დიზაინი (3 ზომა)",
          "ძირითადი ბრენდინგის სახელმძღვანელო",
          "სოციალური მედიის სარეკლამო კრეატივები (5)",
          "2 რევიზიის რაუნდი",
        ]),
        featured: true,
        sortOrder: 2,
      },
    }),
    prisma.package.create({
      data: {
        name: "პრემიუმ პაკეტი",
        slug: "premium-pack",
        price: 2999,
        description:
          "სრული სარეკლამო გადაწყვეტა დამკვიდრებული ბიზნესისთვის, რომელიც მზადაა დაიკავოს ლიდერის პოზიცია ბაზარზე.",
        services: JSON.stringify([
          "პრემიუმ B2B სტრატეგიული სესია",
          "სრული ბრენდინგ-პაკეტი",
          "სავიზიტო ბარათები და ბეჭდვითი მასალა",
          "მრავალპლატფორმული ბანერების ნაკრები",
          "სოციალური მედიის კამპანია (30 დღე)",
          "პროფესიონალური ფოტო/ვიდეო გადაღება (4 სთ)",
          "გამოყოფილი ექაუნთ-მენეჯერი",
          "ულიმიტო რევიზიები",
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
      name: "ადმინისტრატორი",
      role: "ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "client@example.com",
      passwordHash: clientPassword,
      name: "ჯონ სმიტი",
      company: "სმიტ ენტერპრაიზი",
      phone: "+1 (555) 987-6543",
      role: "B_USER",
      activePackageId: packages[1].id,
    },
  });

  const services = [
    {
      title: "უფასო B2B კონსულტაციები",
      slug: "b2b-consultations",
      description:
        "ექსპერტული რჩევები თქვენი სარეკლამო საჭიროებების დასადგენად და ბიზნესის ზრდისთვის მორგებული სტრატეგიის შესაქმნელად.",
      icon: "MessageSquare",
      price: 0,
      bookable: true,
      featured: true,
      sortOrder: 1,
    },
    {
      title: "სავიზიტო ბარათის დიზაინი და ბეჭდვა",
      slug: "business-cards",
      description:
        "პროფესიონალური სავიზიტო ბარათის დიზაინი პრემიუმ ბეჭდვის ვარიანტებით, რომელიც დაუვიწყარ პირველ შთაბეჭდილებას ტოვებს.",
      icon: "CreditCard",
      price: 89,
      bookable: true,
      featured: true,
      sortOrder: 2,
    },
    {
      title: "ბანერის დიზაინი",
      slug: "banner-design",
      description:
        "თვალისმომჭრელი ბანერები ციფრული და ბეჭდვითი მედიისთვის, ოპტიმიზებული მაქსიმალური ხილვადობისა და ეფექტისთვის.",
      icon: "Layout",
      price: 149,
      bookable: true,
      featured: true,
      sortOrder: 3,
    },
    {
      title: "ბრენდინგის სერვისები",
      slug: "branding",
      description:
        "სრული ბრენდის იდენტობის შემუშავება, მათ შორის ლოგოები, ფერთა პალიტრა, ტიპოგრაფია და ბრენდის სახელმძღვანელო.",
      icon: "Palette",
      price: 349,
      bookable: true,
      featured: true,
      sortOrder: 4,
    },
    {
      title: "სოციალური მედიის რეკლამა",
      slug: "social-media",
      description:
        "მიზნობრივი სოციალური მედიის კამპანიები ყველა მთავარ პლატფორმაზე თქვენი იდეალური მომხმარებლების მისაღწევად.",
      icon: "Share2",
      price: 199,
      bookable: true,
      featured: true,
      sortOrder: 5,
    },
    {
      title: "ვიდეო და ფოტო პროდუქცია",
      slug: "media-production",
      description:
        "მაღალი ხარისხის ვიდეო და ფოტოგრაფია რეკლამებისთვის, პროდუქტის გადაღებებისთვის, ღონისძიებებისა და ციფრული კონტენტისთვის.",
      icon: "Camera",
      price: 499,
      bookable: true,
      featured: true,
      sortOrder: 6,
    },
    {
      title: "ინდივიდუალური სერვისები",
      slug: "custom-services",
      description:
        "მორგებული სარეკლამო გადაწყვეტები, შემუშავებული სპეციალურად თქვენი ბიზნესის უნიკალური მოთხოვნებისთვის.",
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

  const consultationService = await prisma.service.findUnique({
    where: { slug: "b2b-consultations" },
  });

  const prospectPassword = await bcrypt.hash("prospect123", 12);
  const prospect = await prisma.user.create({
    data: {
      email: "prospect@example.com",
      passwordHash: prospectPassword,
      name: "ჯეინ პროსპექტი",
      company: "პროსპექტ კომპანია",
      phone: "+1 (555) 111-2222",
      role: "B_USER",
    },
  });

  if (consultationService) {
    const pastConsultation = await prisma.booking.create({
      data: {
        serviceId: consultationService.id,
        userId: prospect.id,
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        timeSlot: "10:00 AM",
        status: "COMPLETED",
        clientName: prospect.name,
        clientEmail: prospect.email,
        clientPhone: prospect.phone ?? "+1 (555) 111-2222",
        company: prospect.company,
      },
    });

    await prisma.user.update({
      where: { id: prospect.id },
      data: { consultationBookingId: pastConsultation.id },
    });
  }

  const mediaItems = [
    {
      title: "ტექ სტარტაპის გაშვების კამპანია",
      description: "სრული ციფრული კამპანია SaaS პროდუქტის გაშვებისთვის",
      category: "CAMPAIGNS" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
      tags: "კამპანია,ციფრული,სტარტაპი",
      featured: true,
      sortOrder: 1,
    },
    {
      title: "ლუქს ბრენდის ფოტოგრაფია",
      description: "პროდუქტის ფოტოგრაფია პრემიუმ მოდის ბრენდისთვის",
      category: "PHOTOGRAPHY" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
      tags: "ფოტოგრაფია,მოდა,ლუქსი",
      featured: true,
      sortOrder: 2,
    },
    {
      title: "კორპორაციული ბრენდის ვიდეო",
      description: "ბრენდის ისტორიის ვიდეო Fortune 500 კომპანიისთვის",
      category: "VIDEO" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80",
      tags: "ვიდეო,კორპორაციული,ბრენდი",
      featured: true,
      sortOrder: 3,
    },
    {
      title: "რესტორნის რებრენდინგი",
      description: "სრული ვიზუალური იდენტობის განახლება რესტორნების ქსელისთვის",
      category: "BRANDING" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
      tags: "ბრენდინგი,რესტორანი,იდენტობა",
      featured: false,
      sortOrder: 4,
    },
    {
      title: "ელ-კომერციის პროდუქტის გადაღება",
      description: "სტუდიური ფოტოგრაფია ონლაინ საცალო კატალოგისთვის",
      category: "PHOTOGRAPHY" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      tags: "ფოტოგრაფია,ელკომერცია,პროდუქტი",
      featured: false,
      sortOrder: 5,
    },
    {
      title: "სოციალური მედიის სარეკლამო სერია",
      description: "მრავალპლატფორმული სარეკლამო კამპანია ფიტნეს ბრენდისთვის",
      category: "CAMPAIGNS" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=400&q=80",
      tags: "კამპანია,სოციალური,ფიტნესი",
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
  console.log("Prospect (consultation credit): prospect@example.com / prospect123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
