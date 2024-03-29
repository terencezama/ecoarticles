import { load } from "cheerio";

const htmlString = `<ul>
<li>Features: Basic style</li>
<li>Stretch: Slightly stretchy</li>
<li>Material composition: 95% rayon, 5% spandex</li>
<li>Care instructions: Machine wash cold. Tumble dry low.</li>
<li>Imported</li>
<li>Product measurements:</li>
</ul><p style="padding-left: 40px;">S: front length 28.1 in, sleeve length 28.9 in, bust 39.8 in</p><p style="padding-left: 40px;">M: front length 28.7 in, sleeve length 29.4 in, bust 42.1 in</p><p style="padding-left: 40px;">L: front length 29.3 in, sleeve length 30 in, bust 44.5 in</p><p style="padding-left: 40px;">XL: front length 29.8 in, sleeve length 30.6 in, bust 46.8 in</p><p style="padding-left: 40px;">2XL: front length 30.4 in, sleeve length 31.2 in, bust 50.7 in</p><p style="padding-left: 40px;">3XL: front length 31 in, sleeve length 31.8 in, bust 54.6 in</p>`;

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

console.log(extractFeatures(htmlString));
