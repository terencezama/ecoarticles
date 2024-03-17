import fs from "fs";
import csvParser from "csv-parser";
import { PrismaClient, Product } from "@prisma/client";

const prisma = new PrismaClient();

const filePath = "data/products_export_1.csv";

interface ShopifyProduct {
  Handle: string;
  Title: string;
  "Body (HTML)": string;
  Vendor: string;
  "Product Category": string;
  Type: string;
  Tags: string;
  Published: string;
  "Option1 Name": string;
  "Option1 Value": string;
  "Option2 Name": string;
  "Option2 Value": string;
  "Option3 Name": string;
  "Option3 Value": string;
  "Variant SKU": string;
  "Variant Grams": string;
  "Variant Inventory Tracker": string;
  "Variant Inventory Policy": string;
  "Variant Fulfillment Service": string;
  "Variant Price": string;
  "Variant Compare At Price": string;
  "Variant Requires Shipping": string;
  "Variant Taxable": string;
  "Variant Barcode": string;
  "Image Src": string;
  "Image Position": string;
  "Image Alt Text": string;
  "Gift Card": string;
  "SEO Title": string;
  "SEO Description": string;
  "Google Shopping / Google Product Category": string;
  "Google Shopping / Gender": string;
  "Google Shopping / Age Group": string;
  "Google Shopping / MPN": string;
  "Google Shopping / Condition": string;
  "Google Shopping / Custom Product": string;
  "Google Shopping / Custom Label 0": string;
  "Google Shopping / Custom Label 1": string;
  "Google Shopping / Custom Label 2": string;
  "Google Shopping / Custom Label 3": string;
  "Google Shopping / Custom Label 4": string;
  "Variant Image": string;
  "Variant Weight Unit": string;
  "Variant Tax Code": string;
  "Cost per item": string;
  "Included / United States": string;
  "Price / United States": string;
  "Compare At Price / United States": string;
  "Included / International": string;
  "Price / International": string;
  "Compare At Price / International": string;
  Status: string;
}

let handle: string = "";
let product: Product | null = null;

const result: ShopifyProduct[] = [];
fs.createReadStream(filePath)
  .pipe(csvParser())
  .on("data", (data: ShopifyProduct) => {
    // Process each row of data here
    result.push(data);
  })
  .on("end", async () => {
    // CSV parsing is complete
    console.log("CSV parsing complete");

    for (const data of result) {
      if (handle !== data.Handle) {
        try {
          console.log("creating", data.Handle);
          product = await prisma.product.create({
            data: {
              handle: data.Handle,
              title: data.Title,
              bodyHtml: data["Body (HTML)"],
              category: data["Product Category"],
              type: data.Type,
              tags: data.Tags,
              published: data.Published === "true",
            },
          });

          console.log(product);
        } catch (error) {
          console.log("error", data.Handle);
        }
        handle = data.Handle;
      }

      console.log("variant");
      await prisma.productVariant.create({
        data: {
          color: data["Option1 Value"],
          size: data["Option2 Value"],
          productId: product!.id,
          imageSrc: data["Image Src"] || data["Variant Image"],
        },
      });
    }
  })
  .on("error", (error) => {
    // Handle any errors that occur during parsing
    console.error("Error while parsing CSV:", error);
  });
