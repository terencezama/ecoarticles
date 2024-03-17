import { PrismaClient, Product, Prisma } from "@prisma/client";
import { load } from "cheerio";

const prisma = new PrismaClient();

async function fetchAllProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        ProductVariant: true,
      },
    });

    products.forEach((product: ProductWithVariants) => {
      describeProduct(product);
    });
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

  //features
  const features = extractFeatures(product.bodyHtml);
  prompt += `Features: ${features.join("\n")}\n\n`;

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

function extractFeatures(htmlString: string) {
  const $ = load(htmlString, null, true);

  function extractTexts($el: any, result: string[]) {
    if ($el.children().length === 0) {
      result.push($el.text());
    }
    $el.children().each((i: number, el: any) => {
      extractTexts($(el), result);
    });
  }

  const result: string[] = [];
  extractTexts($("body"), result);

  return result;
}
// Usage
fetchAllProducts();
