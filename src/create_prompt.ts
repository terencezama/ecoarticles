import { PrismaClient, Product, Prisma } from "@prisma/client";
import cheerio from "cheerio";

const prisma = new PrismaClient();

async function fetchAllProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        ProductVariant: true,
      },
    });
    describeProduct(products[3]);
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

const productWithVariants = Prisma.validator<Prisma.ProductDefaultArgs>()({
  include: { ProductVariant: true },
});
type ProductWithVariants = Prisma.ProductGetPayload<typeof productWithVariants>;

async function describeProduct(product: ProductWithVariants) {
  let prompt = "";
  prompt += `Title: ${product.title}\n`;

  //description
  const $ = cheerio.load(product.bodyHtml);
  prompt += `${$("body").text()}\n\n`;

  //colors
  const containsColor: Record<string, boolean> = {};
  const variants = product.ProductVariant.filter((v: any) => {
    if (!containsColor[v.color]) {
      containsColor[v.color] = true;
      return true;
    }
    return false;
  });

  const colors = variants
    .map((v: any) => {
      return v.color;
    })
    .join(", ");
  prompt += `Colors: ${colors}\n`;
  prompt += `\n\n`;

  //images
  const images = variants
    .map((v: any) => {
      return v.imageSrc;
    })
    .join("\n");

  prompt += `Images:\n${images}\n\n`;

  console.log(prompt);
}

// Usage
fetchAllProducts();
