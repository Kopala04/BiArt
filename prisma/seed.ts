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
  await prisma.printProduct.deleteMany();
  await prisma.printCategory.deleteMany();

  const packages = await Promise.all([
    prisma.package.create({
      data: {
        name: "საწყისი პაკეტი",
        nameEn: "Starter Pack",
        slug: "starter-pack",
        price: 499,
        description:
          "იდეალურია მცირე ბიზნესისთვის, რომელიც პროფესიონალურ რეკლამაში პირველ ნაბიჯს დგამს.",
        descriptionEn:
          "Perfect for small businesses taking their first step into professional advertising.",
        services: JSON.stringify([
          "უფასო B2B კონსულტაცია (30 წთ)",
          "სავიზიტო ბარათის დიზაინი",
          "ძირითადი სოციალური მედიის ბანერი",
          "1 რევიზიის რაუნდი",
        ]),
        servicesEn: JSON.stringify([
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
        name: "სტანდარტული პაკეტი",
        nameEn: "Standard Pack",
        slug: "standard-pack",
        price: 1299,
        description:
          "ჩვენი ყველაზე პოპულარული პაკეტი მზარდი ბიზნესისთვის, რომელსაც ერთიანი ბრენდის წარმოჩენა სჭირდება.",
        descriptionEn:
          "Our most popular package for growing businesses that need a cohesive brand presence.",
        services: JSON.stringify([
          "გაფართოებული B2B კონსულტაცია (60 წთ)",
          "სავიზიტო ბარათის დიზაინი და ბეჭდვა (500 ერთეული)",
          "ბანერის დიზაინი (3 ზომა)",
          "ძირითადი ბრენდინგის სახელმძღვანელო",
          "სოციალური მედიის სარეკლამო კრეატივები (5)",
          "2 რევიზიის რაუნდი",
        ]),
        servicesEn: JSON.stringify([
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
        name: "პრემიუმ პაკეტი",
        nameEn: "Premium Pack",
        slug: "premium-pack",
        price: 2999,
        description:
          "სრული სარეკლამო გადაწყვეტა დამკვიდრებული ბიზნესისთვის, რომელიც მზადაა დაიკავოს ლიდერის პოზიცია ბაზარზე.",
        descriptionEn:
          "Complete advertising solution for established businesses ready to dominate their market.",
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
        servicesEn: JSON.stringify([
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
      titleEn: "Free B2B Consultations",
      slug: "b2b-consultations",
      description:
        "ექსპერტული რჩევები თქვენი სარეკლამო საჭიროებების დასადგენად და ბიზნესის ზრდისთვის მორგებული სტრატეგიის შესაქმნელად.",
      descriptionEn:
        "Expert guidance to identify your advertising needs and create a tailored strategy for your business growth.",
      icon: "MessageSquare",
      price: 0,
      bookable: true,
      featured: true,
      sortOrder: 1,
    },
    {
      title: "სავიზიტო ბარათის დიზაინი და ბეჭდვა",
      titleEn: "Business Card Design & Printing",
      slug: "business-cards",
      description:
        "პროფესიონალური სავიზიტო ბარათის დიზაინი პრემიუმ ბეჭდვის ვარიანტებით, რომელიც დაუვიწყარ პირველ შთაბეჭდილებას ტოვებს.",
      descriptionEn:
        "Professional business card design with premium printing options that leave a lasting first impression.",
      icon: "CreditCard",
      price: 89,
      bookable: true,
      featured: true,
      sortOrder: 2,
    },
    {
      title: "ბანერის დიზაინი",
      titleEn: "Banner Design",
      slug: "banner-design",
      description:
        "თვალისმომჭრელი ბანერები ციფრული და ბეჭდვითი მედიისთვის, ოპტიმიზებული მაქსიმალური ხილვადობისა და ეფექტისთვის.",
      descriptionEn:
        "Eye-catching banners for digital and print media, optimized for maximum visibility and impact.",
      icon: "Layout",
      price: 149,
      bookable: true,
      featured: true,
      sortOrder: 3,
    },
    {
      title: "ბრენდინგის სერვისები",
      titleEn: "Branding Services",
      slug: "branding",
      description:
        "სრული ბრენდის იდენტობის შემუშავება, მათ შორის ლოგოები, ფერთა პალიტრა, ტიპოგრაფია და ბრენდის სახელმძღვანელო.",
      descriptionEn:
        "Complete brand identity development including logos, color palettes, typography, and brand guidelines.",
      icon: "Palette",
      price: 349,
      bookable: true,
      featured: true,
      sortOrder: 4,
    },
    {
      title: "სოციალური მედიის რეკლამა",
      titleEn: "Social Media Advertising",
      slug: "social-media",
      description:
        "მიზნობრივი სოციალური მედიის კამპანიები ყველა მთავარ პლატფორმაზე თქვენი იდეალური მომხმარებლების მისაღწევად.",
      descriptionEn:
        "Targeted social media campaigns across all major platforms to reach your ideal customers.",
      icon: "Share2",
      price: 199,
      bookable: true,
      featured: true,
      sortOrder: 5,
    },
    {
      title: "ვიდეო და ფოტო პროდუქცია",
      titleEn: "Video & Photo Production",
      slug: "media-production",
      description:
        "მაღალი ხარისხის ვიდეო და ფოტოგრაფია რეკლამებისთვის, პროდუქტის გადაღებებისთვის, ღონისძიებებისა და ციფრული კონტენტისთვის.",
      descriptionEn:
        "High-quality video and photography for commercials, product shoots, events, and digital content.",
      icon: "Camera",
      price: 499,
      bookable: true,
      featured: true,
      sortOrder: 6,
    },
    {
      title: "ინდივიდუალური სერვისები",
      titleEn: "Custom Services",
      slug: "custom-services",
      description:
        "მორგებული სარეკლამო გადაწყვეტები, შემუშავებული სპეციალურად თქვენი ბიზნესის უნიკალური მოთხოვნებისთვის.",
      descriptionEn:
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
      titleEn: "Tech Startup Launch Campaign",
      description: "სრული ციფრული კამპანია SaaS პროდუქტის გაშვებისთვის",
      descriptionEn: "Full digital campaign for a SaaS product launch",
      category: "CAMPAIGNS" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
      tags: "კამპანია,ციფრული,სტარტაპი",
      tagsEn: "campaign,digital,startup",
      featured: true,
      sortOrder: 1,
    },
    {
      title: "ლუქს ბრენდის ფოტოგრაფია",
      titleEn: "Luxury Brand Photography",
      description: "პროდუქტის ფოტოგრაფია პრემიუმ მოდის ბრენდისთვის",
      descriptionEn: "Product photography for a premium fashion brand",
      category: "PHOTOGRAPHY" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80",
      tags: "ფოტოგრაფია,მოდა,ლუქსი",
      tagsEn: "photography,fashion,luxury",
      featured: true,
      sortOrder: 2,
    },
    {
      title: "კორპორაციული ბრენდის ვიდეო",
      titleEn: "Corporate Brand Video",
      description: "ბრენდის ისტორიის ვიდეო Fortune 500 კომპანიისთვის",
      descriptionEn: "Brand story video for a Fortune 500 company",
      category: "VIDEO" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=400&q=80",
      tags: "ვიდეო,კორპორაციული,ბრენდი",
      tagsEn: "video,corporate,brand",
      featured: true,
      sortOrder: 3,
    },
    {
      title: "რესტორნის რებრენდინგი",
      titleEn: "Restaurant Rebrand",
      description: "სრული ვიზუალური იდენტობის განახლება რესტორნების ქსელისთვის",
      descriptionEn: "Complete visual identity overhaul for a restaurant chain",
      category: "BRANDING" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80",
      tags: "ბრენდინგი,რესტორანი,იდენტობა",
      tagsEn: "branding,restaurant,identity",
      featured: false,
      sortOrder: 4,
    },
    {
      title: "ელ-კომერციის პროდუქტის გადაღება",
      titleEn: "E-commerce Product Shoot",
      description: "სტუდიური ფოტოგრაფია ონლაინ საცალო კატალოგისთვის",
      descriptionEn: "Studio photography for an online retail catalog",
      category: "PHOTOGRAPHY" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
      tags: "ფოტოგრაფია,ელკომერცია,პროდუქტი",
      tagsEn: "photography,ecommerce,product",
      featured: false,
      sortOrder: 5,
    },
    {
      title: "სოციალური მედიის სარეკლამო სერია",
      titleEn: "Social Media Ad Series",
      description: "მრავალპლატფორმული სარეკლამო კამპანია ფიტნეს ბრენდისთვის",
      descriptionEn: "Multi-platform ad campaign for a fitness brand",
      category: "CAMPAIGNS" as const,
      mediaUrl:
        "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=800&q=80",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1611162617474-5b21e939e113?w=400&q=80",
      tags: "კამპანია,სოციალური,ფიტნესი",
      tagsEn: "campaign,social,fitness",
      featured: false,
      sortOrder: 6,
    },
  ];

  for (const item of mediaItems) {
    await prisma.mediaItem.create({ data: item });
  }

  await seedPrintCatalog();

  console.log("Seed completed successfully");
  console.log("Admin: admin@biart.com / admin123");
  console.log("Client: client@example.com / client123");
  console.log("Prospect (consultation credit): prospect@example.com / prospect123");
}

async function seedPrintCatalog() {
  await prisma.printCategory.create({
    data: {
      name: "მაისურები",
      nameEn: "T-Shirts",
      slug: "t-shirts",
      description: "ბამბისა და პოლო მაისურები ლოგოთი — იდეალურია გუნდისთვის და ღონისძიებებისთვის.",
      descriptionEn:
        "Cotton and polo shirts with your logo — ideal for teams and events.",
      icon: "Shirt",
      sortOrder: 1,
      products: {
        create: [
          {
            name: "სტანდარტული ბამბის მაისური",
            nameEn: "Standard Cotton T-Shirt",
            slug: "standard-cotton-tee",
            description: "ერთფეროვანი, ეკრანის ბეჭდვა 1 ადგილზე",
            descriptionEn: "Solid color, single-location screen print",
            price: 12,
            priceNote: "ერთფეროვანი ბეჭდვა",
            priceNoteEn: "Single-color print",
            unit: "ცალი",
            unitEn: "pc",
            sortOrder: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop",
          },
          {
            name: "პრემიუმ პოლო",
            nameEn: "Premium Polo",
            slug: "premium-polo",
            description: "გაჭიმვადი ქსოვილი, ლოგო გულზე ან უკან",
            descriptionEn: "Stretch fabric, chest or back logo",
            price: 22,
            priceNote: "ორი ბეჭდვის ადგილი",
            priceNoteEn: "Up to 2 print locations",
            unit: "ცალი",
            unitEn: "pc",
            sortOrder: 2,
            imageUrl:
              "https://images.unsplash.com/photo-1586363104862-3a5e2c60d5c3?w=600&auto=format&fit=crop",
          },
        ],
      },
    },
  });

  await prisma.printCategory.create({
    data: {
      name: "ჭიქები და ბოთლები",
      nameEn: "Mugs & Drinkware",
      slug: "drinkware",
      description: "კერამიკული ჭიქები, თერმოსები და სასმელის ჭიქები ბრენდირებული ბეჭდვით.",
      descriptionEn:
        "Ceramic mugs, thermoses, and drinkware with branded printing.",
      icon: "Coffee",
      sortOrder: 2,
      products: {
        create: [
          {
            name: "კერამიკული ჭიქა 330ml",
            nameEn: "Ceramic Mug 330ml",
            slug: "ceramic-mug-330",
            description: "სრული ფერის სუბლიმაცია ან ლოგო",
            descriptionEn: "Full-color sublimation or logo wrap",
            price: 8,
            unit: "ცალი",
            unitEn: "pc",
            sortOrder: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1514228742589-6bfd06f1ef85?w=600&auto=format&fit=crop",
          },
          {
            name: "თერმოსი 500ml",
            nameEn: "Thermos 500ml",
            slug: "thermos-500",
            description: "უჟანგავი ფოლადი, ლაზერული ან UV ბეჭდვა",
            descriptionEn: "Stainless steel, laser or UV print",
            price: 18,
            unit: "ცალი",
            unitEn: "pc",
            sortOrder: 2,
            imageUrl:
              "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop",
          },
        ],
      },
    },
  });

  await prisma.printCategory.create({
    data: {
      name: "სათვალეები",
      nameEn: "Glasses & Eyewear",
      slug: "glasses",
      description: "სარეკლამო სათვალეები და ოპტიკური ჩარჩოები ბრენდირებული ბეჭდვით.",
      descriptionEn: "Promotional sunglasses and frames with custom branding.",
      icon: "Glasses",
      sortOrder: 3,
      products: {
        create: [
          {
            name: "სარეკლამო სათვალე",
            nameEn: "Promotional Sunglasses",
            slug: "promo-sunglasses",
            description: "UV დაცვა, ლოგო კალათებზე",
            descriptionEn: "UV protection, logo on temples",
            price: 4.5,
            unit: "ცალი",
            unitEn: "pc",
            sortOrder: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1572635196233-14f4e41d0e9a?w=600&auto=format&fit=crop",
          },
        ],
      },
    },
  });

  await prisma.printCategory.create({
    data: {
      name: "სარეკლამო საგნები",
      nameEn: "Promotional Items",
      slug: "promotional",
      description: "ჩანთები, ბლოკნოტები, ბეჯები და სხვა სტანდარტული სარეკლამო მასალა.",
      descriptionEn:
        "Bags, notebooks, badges, and other standard promotional merchandise.",
      icon: "Package",
      sortOrder: 4,
      products: {
        create: [
          {
            name: "ტყავის ჩანთა",
            nameEn: "Tote Bag",
            slug: "tote-bag",
            description: "ბამბის ტყავი, ერთმხრივი ბეჭდვა",
            descriptionEn: "Cotton tote, single-side print",
            price: 6,
            unit: "ცალი",
            unitEn: "pc",
            sortOrder: 1,
            imageUrl:
              "https://images.unsplash.com/photo-1544816565-036ba25f1233?w=600&auto=format&fit=crop",
          },
          {
            name: "ბეჯი / ბეიჯი",
            nameEn: "Name Badge",
            slug: "name-badge",
            description: "პინს ბეჯი ლოგოთი",
            descriptionEn: "Pin badge with logo",
            price: 2.5,
            unit: "ცალი",
            unitEn: "pc",
            sortOrder: 2,
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
