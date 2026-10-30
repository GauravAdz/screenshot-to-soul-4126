interface Explanation {
  aliases: string[];
  title: string;
  what: string;
}

// General, educational descriptions only — never diagnoses.
const LIST: Explanation[] = [
  { aliases: ["hemoglobin", "haemoglobin", "hgb", "hb"], title: "Hemoglobin", what: "The protein in red blood cells that carries oxygen from your lungs to the rest of your body." },
  { aliases: ["hematocrit", "hct"], title: "Hematocrit", what: "The share of your blood volume made up of red blood cells." },
  { aliases: ["white blood", "wbc", "leukocyte"], title: "White blood cells", what: "Cells of the immune system that help your body respond to infections and inflammation." },
  { aliases: ["red blood", "rbc", "erythrocyte"], title: "Red blood cells", what: "The number of cells that carry oxygen through your blood." },
  { aliases: ["platelet", "plt", "thrombocyte"], title: "Platelets", what: "Small cell fragments that help your blood clot when you're injured." },
  { aliases: ["glucose", "blood sugar"], title: "Glucose", what: "The amount of sugar in your blood, your body's main source of energy. Levels change with meals and timing." },
  { aliases: ["hba1c", "a1c", "glycated"], title: "HbA1c", what: "Reflects your average blood sugar over roughly the past 2–3 months." },
  { aliases: ["ldl"], title: "LDL cholesterol", what: "A type of cholesterol carried in particles sometimes called \"bad\" cholesterol." },
  { aliases: ["hdl"], title: "HDL cholesterol", what: "A type of cholesterol often called \"good\" cholesterol because it helps carry cholesterol away from blood vessels." },
  { aliases: ["cholesterol"], title: "Total cholesterol", what: "The overall amount of cholesterol, a fatty substance your body uses to build cells and hormones." },
  { aliases: ["triglyceride"], title: "Triglycerides", what: "A type of fat in your blood that stores energy. Levels can be affected by recent meals." },
  { aliases: ["creatinine"], title: "Creatinine", what: "A waste product from normal muscle activity that the kidneys filter out of the blood." },
  { aliases: ["egfr"], title: "eGFR", what: "An estimate of how well your kidneys filter blood, calculated from creatinine and other factors." },
  { aliases: ["urea", "bun"], title: "Urea / BUN", what: "A waste product from breaking down protein, removed by the kidneys." },
  { aliases: ["tsh", "thyroid stimulating"], title: "TSH", what: "A hormone from the pituitary gland that tells your thyroid how much hormone to make." },
  { aliases: ["alt", "alanine"], title: "ALT", what: "An enzyme found mostly in the liver; its level in blood is one of several signals about liver cells." },
  { aliases: ["ast", "aspartate"], title: "AST", what: "An enzyme found in the liver, heart and muscles." },
  { aliases: ["sodium", "na"], title: "Sodium", what: "A mineral (electrolyte) that helps control fluid balance and nerve and muscle function." },
  { aliases: ["potassium", "k"], title: "Potassium", what: "An electrolyte important for heart rhythm, nerves and muscles." },
  { aliases: ["vitamin d", "25-oh", "25 oh"], title: "Vitamin D", what: "A vitamin that supports bone health and calcium absorption." },
  { aliases: ["ferritin"], title: "Ferritin", what: "A protein that stores iron; its level gives a picture of your body's iron stores." },
  { aliases: ["crp", "c-reactive"], title: "C-reactive protein", what: "A protein that rises in the blood when there is inflammation somewhere in the body." },
];

export function explain(name: string): Explanation | null {
  const n = name.toLowerCase();
  const words = n.split(/[^a-z0-9-]+/);
  return (
    LIST.find((e) => e.aliases.some((a) => (a.length <= 3 ? words.includes(a) : n.includes(a)))) ?? null
  );
}
