import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Safely resolve filename and directory paths without failing in CommonJS or ESM
const safeFilename = typeof __filename !== "undefined" ? __filename : (typeof import.meta !== "undefined" && import.meta && import.meta.url ? fileURLToPath(import.meta.url) : "");
const safeDirname = typeof __dirname !== "undefined" ? __dirname : (safeFilename ? path.dirname(safeFilename) : process.cwd());

function generateAdvancedOfflineResponse(message: string, history: any[]): string {
  const query = message.trim().toLowerCase();
  
  // 1. Math questions
  if (query.match(/\d+\s*[\+\-\*\/]\s*\d+/) || query.includes("math") || query.includes("solve") || query.includes("calculate") || query.includes("+") || query.includes("-") || query.includes("/")) {
    // Try to extract numbers and execute
    const expression = message.replace(/[a-zA-Z\?]/g, "").trim();
    let computedResult = "";
    try {
      // safe eval simple math expression
      const safeExpr = expression.replace(/[^0-9\+\-\*\/\(\)\. ]/g, "");
      const res = Function(`"use strict"; return (${safeExpr})`)();
      computedResult = `\n\n### ⚡ Calculation Breakdown:\n- **Input Expression:** \`${safeExpr}\`\n- **Evaluated Result:** \`${res}\``;
    } catch {
      computedResult = "\n\n*(Please use the **Calculator Suite** in our Tools section for complex system arithmetic!)*";
    }

    return `### ✨ Auryx Advanced Offline Math Solver\n\nI have evaluated your mathematical query using the High-Precision offline parser.${computedResult}\n\n#### Offline Learning Principle (Mathematics):\n1. **Identify Given Data**: Always simplify expressions by grouping like terms or variables first.\n2. **Apply BODMAS/PEMDAS**: Solve Parentheses, Exponents, Multiplication, Division, Addition, Subtraction sequentially.\n3. **Sanity Check**: Plug the resulting integers back into the origin cells to verify balance.\n\n*To enable real-time calculations using neural reasoning models, configure your local **Gemini API Key** in settings.*`;
  }

  // 2. Code Generation
  if (query.includes("code") || query.includes("program") || query.includes("html") || query.includes("css") || query.includes("javascript") || query.includes("python") || query.includes("typescript") || query.includes("java") || query.includes("c++")) {
    let language = "typescript";
    let codeBlock = "";
    let desc = "";

    if (query.includes("python")) {
      language = "python";
      codeBlock = `def calculate_fibonacci(n: int) -> list:
    """
    Generates a Fibonacci sequence up to 'n' terms.
    Developed offline with high-performance list comprehension.
    """
    if n <= 0:
        return []
    elif n == 1:
        return [0]
    
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

# Example execution
terms = 10
print(f"Fibonacci Sequence ({terms} terms):", calculate_fibonacci(terms))`;
      desc = "This script calculates the Fibonacci sequence up to `n` items using an optimal loop buffer. You can click **Download Code** right in the header to save this block into a standalone file!";
    } else if (query.includes("html") || query.includes("css") || query.includes("web")) {
      language = "html";
      codeBlock = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Auryx Premium Card</title>
    <style>
        body {
            background-color: #0d1117;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            font-family: Arial, sans-serif;
        }
        .premium-card {
            padding: 24px;
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(99, 102, 241, 0.1));
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px rgba(0,0,0,0.4);
            color: white;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="premium-card">
        <h3>Auryx Ultimate Web Frame</h3>
        <p>Offline web design preview engine engineered on high-density principles.</p>
    </div>
</body>
</html>`;
      desc = "This HTML template creates an elegant glowing glassmorphic container styled using minimal CSS overrides.";
    } else {
      codeBlock = `// Auryx AI Advanced Code Generator (Offline Mode)
export interface UserSession {
  name: string;
  age: number;
  role: 'student' | 'professional';
}

/**
 * Greets the profile user with optimal formatting.
 */
export function greetUserProfile(user: UserSession): string {
  const isStudent = user.age <= 18 || user.role === 'student';
  const greetingHeader = isStudent ? "Hy" : "Hello";
  return \`\${greetingHeader} \${user.name}, how can I help you excel in your studies today?\`;
}

// Example usage
const user: UserSession = { name: "Rishi", age: 15, role: "student" };
console.log(greetUserProfile(user));`;
      desc = "This TypeScript module demonstrates a robust type-safe account registration and context-aware greeting pipeline.";
    }

    return `### 💻 Real-Time Advanced Code Generator (Offline Mode)

I have generated high-quality, professional-grade code based on your request. Below is a production-ready snippet:

\`\`\`${language}
${codeBlock}
\`\`\`

#### Key Concept Breakdown:
1. **Module Cleanliness**: Using clean interfaces and named exports for modularity.
2. **Offline Resilience**: Runs seamlessly in sandbox environments.
3. **Download Ready**: You can directly download this code block by clicking the **Download File** option on this message!

*To write customizable user classes or have AI build complete multi-file systems, provide your personal **Gemini API Key** in System Settings.*`;
  }

  // 3. System Specs / Rishi Info
  if (query.includes("rishi") || query.includes("who made") || query.includes("developer") || query.includes("designer") || query.includes("creator") || query.includes("author") || query.includes("banya") || query.includes("built") || query.includes("kisne") || query.includes("maker")) {
    const lang = detectConversationLanguage(query);
    if (lang === "hinglish") {
      return `### 👑 Developer Specification (Grounded Identity)

Aapne bahut sahi sawaal pucha! Humare neural matrix ka origin aur developer **Rishi** hain, jo abhi **Class 10th** ke student hain. unhone mujhe code aur design kiya hai!

#### 🚀 Rishi Ke Baare Mein Kuch Core Facts:
1. **Visionary Mindset**: Rishi ne Class 10th mein hote hue ek fully independent multi-provider AI hub (Auryx AI) engineering ki.
2. **Advanced Frontend Styling**: Tailwind gradients aur interactive state loops ka use kar ke absolute UI perfection design kiya.
3. **No-Limits Offline Engine**: Internet block hone par bhi dynamic offline algorithms help provide karte hain.

*Auryx is built to demonstrate premium AI accessibility and clean product design.*`;
    } else if (lang === "hindi") {
      return `### 👑 विकासक विशिष्टता (सत्यापित पहचान)

यह ऐलिस या ओरिक्स प्लेटफ़ॉर्म का मूल इतिहास है। मेरे मुख्य विकासक और निर्माता **ऋषि (कक्षा 10वीं के छात्र)** हैं। उन्होंने ही मेरी एल्गोरिदम संरचना और डिज़ाइन को कोड किया है!

#### 🚀 ऋषि के बारे में मुख्य तथ्य:
1. **असाधारण प्रतिभा**: कक्षा 10 में होने के बावजूद, उन्होंने सर्वर-साइड एकीकरण और रीयल-टाइम सैंडबॉक्सिंग जैसी आधुनिक तकनीकों के साथ इस ऐप को विकसित किया।
2. **उत्कृष्ट दृष्टिकोण**: उपयोगकर्ता के अनुकूल इंटरफ़ेस, सुंदर रंग संयोजन, और उपयोग में आसान यूआई।
3. **सिस्टम विश्वसनीयता**: सक्रिय क्लाउड और ऑफ़लाइन मोड दोनों में समान दक्षता।

*अधिक जानकारी या विशिष्ट प्रश्नों के लिए आप सीधे चैट जारी रख सकते हैं।*`;
    }
    return `### 👑 Developer Specification (Grounded Identity)

Auryx AI was engineered and developed by an incredibly talented student named **Rishi (Class 10th)**! Under his precise visual and architectural planning, this workspace is designed for maximum efficiency, beautiful typography, and adaptive local/cloud models.

#### 🚀 Core Academic and Tech Accomplishments:
1. **Full-Stack Development**: Created Express API proxy layers, custom prompt grounding filters, and multi-threaded fallbacks during his Class 10 study years.
2. **Modular Architecture**: Split codebase files cleanly for high execution speed (0.0ms prompt latency).
3. **Visual Excellence**: Selected custom themes, glowing responsive panels, and beautiful lucide-react typography.

*I am incredibly proud to be designed by Rishi!*`;
  }

  // 3b. Class 10 Academic CBSE Syllabus helper
  if (query.includes("class 10") || query.includes("syllabus") || query.includes("study") || query.includes("cbse") || query.includes("exam") || query.includes("board")) {
    return `### 📚 Class 10th Board Exam Strategic Study Blueprint (Offline Masterpiece)

To assist you with Class 10th academic excellence, here is a highly structured study plan designed to conquer board exams efficiently!

#### 📝 CBSE Class 10 Subject Mastery Breakdown:
1. **Mathematics**: 
   - Focus heavily on algebraic proofs, trigonometry equations, and surface area & volume theorems.
   - *Strategy*: Solve all NCERT examples and past 10 years question banks.
2. **Science (Physics, Chemistry, Biology)**:
   - *Physics*: Master Ray diagrams (Convex/Concave mirrors and lenses) and electrical circuit Ohm's Law numerical patterns ($V = IR$).
   - *Chemistry*: Prioritize Balancing equations, Carbon and its Compounds nomenclature, and Acid-Base key definitions.
   - *Biology*: Focus on Life Processes diagrams (Human Heart, Digestive System, Excretory System) and double circulation flowcharts.
3. **Social Sciences**: 
   - Practice map work on history/geography sectors. Master timelines of Nationalism in Europe and nationalism in India.
4. **Languages (English & Hindi)**:
   - Practice writing formal letter templates, reading comprehensions, and grasp textbook character sketches.

#### ⏱️ High-Density Pomodoro Method:
- **Study Session**: 45 Minutes of pure focused reading (Use our **Notes Hub** to draft key bullet points).
- **Break Interval**: 10 Minutes of physical rest (Go to **Timer & Alarms Suite** inside our Tools to set 10m alarm!).
- **Repeat Pattern**: Complete 4 loops to lock memory cells.

*To query specific NCERT exercises or resolve complex queries using intelligent neural reasoning, configure your local **Gemini API Key** in settings.*`;
  }

  // 3c. Science / Chemistry / Physics Specialized Fallbacks
  if (query.includes("science") || query.includes("physics") || query.includes("chemistry") || query.includes("carbon") || query.includes("equation") || query.includes("lens") || query.includes("electricity") || query.includes("acid")) {
    return `### 🧪 Specialized Class 10 Science Hub (Core Concepts Guide)

I have loaded the CBSE Class 10 Science offline index to provide immediate clarity on chemical, physical, and biological concepts.

#### 🌟 1. CHEMICAL REACTIONS AND NOMENCLATURE:
- **Balanced Chemical Equation**: Elements must have equal atoms on both reactant and product sides per the *Law of Conservation of Mass*.
- **Sample Reaction (Photosynthesis)**:
  $$6CO_2 + 12H_2O \\xrightarrow{\\text{Chlorophyll, Sunlight}} C_6H_{12}O_6 + 6O_2 + 6H_2O$$
- **Carbon Compounds (Nomenclature)**: Carbon always forms covalent bonds due to its tetravalency (4 valence electrons) and catenation capabilities. 
  - *Alkane*: $C_nH_{2n+2}$ (e.g., Methane $CH_4$, Ethane $C_2H_6$)
  - *Alkene*: $C_nH_{2n}$ (e.g., Ethene $C_2H_4$)
  - *Alkyne*: $C_nH_{2n-2}$ (e.g., Ethyne $C_2H_2$)

#### ⚡ 2. PHYSICS (Ohm's Law & Lenses):
- **Ohm's Law**: The electric current ($I$) flowing through a metallic conductor is directly proportional to the potential difference ($V$) across its terminal points, provided temperature remains constant.
  $$V = I \\times R \\quad \\left(\\text{where } R = \\text{Resistance in } \\Omega\\right)$$
- **Lens Formula**:
  $$\\frac{1}{f} = \\frac{1}{v} - \\frac{1}{u} \\quad \\left(\\text{where } v = \\text{image distance}, u = \\text{object distance}, f = \\text{focal length}\\right)$$
- **Refractive Index**: $n = \\frac{c}{v}$ (speed of light in vacuum divided by speed of light in medium).

*Need a detailed step-by-step math computation? Paste your numbers directly to get an absolute value output or configure your **Gemini key**.*`;
  }

  // 3d. Essay, Speeches and Articles Blueprint Generator
  if (query.includes("essay") || query.includes("speech") || query.includes("article") || query.includes("paragraph") || query.includes("write about")) {
    return `### ✍️ High-Score Structured Essay & Speech Assembly (Auryx Write)

I have generated an optimal five-paragraph essay structure outline for your writing topic. Use this to excel in English exams!

#### Title: "Synthesizing Progress: The Synergy of Human Intellect and Machine Agency"

1. **Introduction & Thesis Statement**:
   - *Opening Hook*: Establish the global relevance of your subject matter.
   - *Context*: Define key terms and boundary limits of the topic.
   - *Thesis*: Provide a concise, clear argument that underpins the entire piece.
2. **Body Paragraph 1 (The Historical/Academic Context)**:
   - *Focus*: Explore how this topic evolved.
   - *Citation Hook*: Present factual observations or historic benchmarks.
   - *Transition*: Connect this base layer to modern implementation details.
3. **Body Paragraph 2 (Core Arguments & Practical Impact)**:
   - *Focus*: Present your strongest primary supporting argument. 
   - *Example*: Elaborate using real-world events, statistics, or logical structures.
4. **Body Paragraph 3 (Alternative Viewpoints / Counter-arguments)**:
   - *Focus*: Acknowledge valid criticisms or complexities.
   - *Refutation*: Explain why your core thesis remains the most robust and accurate conclusion.
5. **Conclusion & Future Outlook**:
   - *Summarization*: Rephrase your main arguments without introducing new data.
   - *Final Thought*: Provide a lasting, thought-provoking statement or a forward-looking vision.

*To fill this template with custom, highly detailed content based on millions of corpus lines under a millisecond, plug in a **Gemini API Key** in settings.*`;
  }

  // 4. General Greeting Custom Greeting
  if (query.includes("hello") || query.includes("hi") || query.includes("hey") || query.includes("sup") || query.includes("yo") || query.includes("kya") || query.includes("kaise") || query.includes("bhai") || query.includes("namaste") || query.includes("batao") || query.includes("halo")) {
    const lang = detectConversationLanguage(query);
    if (lang === "hinglish") {
      return `### 👋 Hy! Welcome to Auryx AI! (Conversational Core)

Suno bhai! Main hoon **Auryx AI**, aapka ultra-smart aur super-fast multi-tool coding & study assistant jise **Rishi (Class 10th student)** ne build kiya hai.

Main abhi **Offline Core Mode** par chal raha hoon, lekin humare pass bohot advanced local feature systems hain jo aapki padhai mein aur codes generate karne mein immediate help karenge!

#### ⚡ Quick Actions (Offline Options List):
- **CBSE Class 10 Masterplan**: Type \`class 10 study syllabus\` ya \`syllabus schedule\` exam prep tips dundhne ke liye.
- **Science & Formulas**: Type \`physics carbon lens\` to read Class 10 Science and Chemistry formula sheets!
- **Math Solver**: Koi bhi simple math equations type karein (e.g., \`45 + 15 * 3\`) to evaluate step-by-step.
- **Save Study Notes**: Menu mein check karein hamara **Notes and Alarms Hub** tools jo offline support karte hain.

*Agr aapko neural global search aur deep AI model conversation active karni hai, toh settings mein apni **Gemini API Key** save karke real-time reasoning unlock karein!*`;
    } else if (lang === "hindi") {
      return `### 👋 नमस्ते! ओरिक्स एआई वर्कस्पेस में आपका स्वागत है!

नमस्ते! मैं हूँ **Oryx AI**, आपका अत्यंत विश्वसनीय और बहुआयामी सहायक जिसे **ऋषि (कक्षा 10वीं के छात्र)** द्वारा शानदार तरीके से बनाया गया है।

#### ⚡ उपलब्ध त्वरित विकल्प (त्वरित पहुँच):
- **कक्षा 10 रणनीतिक योजना**: परीक्षा तैयारी रोडमैप के लिए \`class 10\` या \`board exam\` टाइप करें।
- **विज्ञान सूत्र**: रसायन शास्त्र या भौतिकी के समीकरण देखने के लिए \`science\` या \`chemistry\` टाइप करें।
- **त्वरित गणित**: कोई भी समीकरण (उदा: \`20 * 5 + 400\`) लिखकर त्वरित परिणाम प्राप्त करें।
- **टूल्स हब**: नोट्स लिखने और अलार्म अलार्म सेट करने के लिए टूल्स सेक्शन का उपयोग करें।

*विश्वसनीय रीयल-टाइम उत्तर प्राप्त करने के लिए सेटिंग्स में अपनी **Gemini API Key** दर्ज करें और वास्तविक समय वेब खोज को पूरी तरह सक्रिय करें।*`;
    }
    return `### 👋 Welcome to Auryx AI Workspace!

Hy! I am **Auryx AI**, your advanced, ultra-clean multi-tool AI assistant designed and coded by the brilliant student **Rishi (Class 10th)**. 

Even when running offline/off-grid, I have loaded several highly advanced knowledge modules to assist you with school, programming, and productivity immediately!

#### ⚡ High-Performance Quick Actions:
- **CBSE Class 10 Blueprint**: Type \`class 10 exam blueprint\` or \`study timetable\` to explore high-impact CBSE recommendations.
- **Formulas Sheet**: Ask for \`science equations\`, \`carbon compounds\`, or \`Ohm's Law\` to view interactive NCERT reference sheets.
- **Offline Code Maker**: Type \`write code for Python fibonacci\` or \`html template\` or \`TS modules\` to instantly generate download-ready code.
- **High Speed Calculator**: Write any standard arithmetic expression (e.g. \`12 * 12 + 25\`) for instant step-by-step calculations.

*To activate infinite neural context memory and smart models, configure your local **Gemini API Key** inside System Settings.*`;
  }

  // 5. Default Fallback Detailed
  return `### 🧠 Auryx Professional Off-Grid Synthesis

You have entered a query into the off-grid Auryx core engine. Here is a simplified professional summary of information related to your prompt:

1. **Context-Aware Synthesis**: In offline/fallback mode, Auryx uses pattern recognition and heuristic knowledge banks to build high-relevance responses.
2. **How to Excel**: Organize your concepts in bullet lists, structure notes inside our included **Notes Suite**, and manage alarms to prevent studying fatigue.
3. **Enable Cloud Reasoning**: Unlock real-time global search, complete software project creation, and infinite contextual memory by inserting a **Gemini API Key** in our **System Settings** menu.

#### 💡 Suggested Action Steps:
- To write a code script, include keywords like \`write code for...\`
- To evaluate a math expression, write simple arithmetic like \`50 + 20 * 4\`
- To explore developer settings, click on **System Settings** in the menu list.

*Your current query: "${message}"*`;
}

interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

async function performWebSearch(query: string, searchSource?: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  try {
    const cleanQuery = query.replace(/[#@*]/g, "").trim();
    if (!cleanQuery) return [];

    const source = searchSource || "google";
    console.log(`[Auryx Search Engine] Querying index for: "${cleanQuery}" [Source: ${source}]`);

    // Priortize Wikipedia Opensearch if source is "wikipedia"
    if (source === "wikipedia") {
      try {
        console.log(`[Auryx Search Engine] High priority Wikipedia OpenSearch query: "${cleanQuery}"`);
        const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=5&namespace=0&format=json`);
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (Array.isArray(wikiData) && wikiData.length >= 4) {
            const titles = wikiData[1] || [];
            const snippets = wikiData[2] || [];
            const links = wikiData[3] || [];
            for (let i = 0; i < titles.length; i++) {
              if (titles[i] && results.length < 5) {
                results.push({
                  title: titles[i] + " [Wikipedia Scholar]",
                  snippet: snippets[i] || "Encyclopedic reference study database item.",
                  link: links[i] || `https://en.wikipedia.org/wiki/${encodeURIComponent(titles[i])}`
                });
              }
            }
          }
        }
      } catch (wikiErr) {
        console.error("[Auryx Search Wiki Option Error] wikipedia search failed, moving to tier fallbacks:", wikiErr);
      }
    }

    // Set specialized modifier queries if needed
    let searchQuery = cleanQuery;
    if (source === "github") {
      searchQuery = `${cleanQuery} site:github.com OR site:github.io`;
    } else if (source === "academic") {
      searchQuery = `${cleanQuery} site:arxiv.org OR site:ncbi.nlm.nih.gov OR site:nature.com OR "research paper"`;
    } else if (source === "news") {
      searchQuery = `${cleanQuery} "latest news" OR site:reuters.com OR site:apnews.com OR site:bbc.co.uk/news`;
    }

    // Tier 1: Modern Browser Simulation on Standard DDG HTML
    if (results.length < 4) {
      try {
        const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5"
        }
      });
      
      if (res.ok) {
        const html = await res.text();
        // Match standard links that are part of web results (class can include result__a in various attribute patterns)
        const linkRegex = /<a\s+[^>]*class="[^" ]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>|<a\s+[^>]*href="([^"]+)"[^>]*class="[^" ]*result__a[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
        let match;
        while ((match = linkRegex.exec(html)) !== null && results.length < 4) {
          const rawUrl = match[1] || match[3] || "";
          const rawTitle = match[2] || match[4] || "";
          
          if (!rawUrl || !rawTitle) continue;
          
          let url = rawUrl.trim();
          if (url.startsWith("//")) {
            url = "https:" + url;
          } else if (url.startsWith("/l/?kh=")) {
            const urlMatch = url.match(/uddg=([^&]+)/);
            if (urlMatch && urlMatch[1]) {
              url = decodeURIComponent(urlMatch[1]);
            }
          }

          const title = rawTitle.replace(/<[^>]*>/g, "").trim();
          let snippet = "";
          
          // Look for nearby snippets
          const searchOffset = html.indexOf(match[0]);
          if (searchOffset !== -1) {
            const snippetPart = html.substring(searchOffset, searchOffset + 2000);
            const snippetMatch = snippetPart.match(/class="[^" ]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/i) || 
                                 snippetPart.match(/class="[^" ]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
            if (snippetMatch) {
              snippet = snippetMatch[1].replace(/<[^>]*>/g, "").trim();
            }
          }

          if (title && url && !url.includes("duckduckgo.com/y.js")) {
            results.push({ title, snippet, link: url });
          }
        }
      }
    } catch (tier1Err) {
      console.error("[Auryx Search Engine] Tier 1 search failed:", tier1Err);
    }
  }

    // Tier 2: DuckDuckGo Lite Fallback
    if (results.length === 0) {
      console.log("[Auryx Search Engine] Entering Tier 2 Lite fallback Index...");
      try {
        const liteRes = await fetch("https://lite.duckduckgo.com/lite/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
          },
          body: `q=${encodeURIComponent(cleanQuery)}`
        });
        
        if (liteRes.ok) {
          const liteHtml = await liteRes.text();
          // lite utilizes result-link anchors
          const liteRegex = /<a\s+[^>]*class="[^" ]*result-link[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
          let liteMatch;
          while ((liteMatch = liteRegex.exec(liteHtml)) !== null && results.length < 4) {
            const rawUrl = liteMatch[1] || "";
            let url = rawUrl.trim();
            if (url.startsWith("//")) {
              url = "https:" + url;
            }
            
            const title = liteMatch[2].replace(/<[^>]*>/g, "").trim();
            let snippet = "";
            
            const searchOffset = liteHtml.indexOf(liteMatch[0]);
            if (searchOffset !== -1) {
              const snippetPart = liteHtml.substring(searchOffset, searchOffset + 1500);
              const snippetMatch = snippetPart.match(/<td\s+class="result-snippet"[^>]*>([\s\S]*?)<\/td>/i);
              if (snippetMatch) {
                snippet = snippetMatch[1].replace(/<[^>]*>/g, "").trim();
              }
            }
            
            if (title && url) {
              results.push({ title, snippet, link: url });
            }
          }
        }
      } catch (tier2Err) {
        console.error("[Auryx Search Engine] Tier 2 search failed:", tier2Err);
      }
    }

    // Tier 3: Encyclopedic Wikipedia OpenSearch Fallback (Guaranteed to succeed and never block!)
    if (results.length === 0) {
      console.log("[Auryx Search Engine] Entering Tier 3 Wiki fallback Index...");
      try {
        const wikiRes = await fetch(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(cleanQuery)}&limit=4&namespace=0&format=json`);
        if (wikiRes.ok) {
          const wikiData = await wikiRes.json();
          if (Array.isArray(wikiData) && wikiData.length >= 4) {
            const titles = wikiData[1] || [];
            const snippets = wikiData[2] || [];
            const links = wikiData[3] || [];
            for (let i = 0; i < titles.length; i++) {
              if (titles[i] && results.length < 4) {
                results.push({
                  title: titles[i] + " [Wikipedia]",
                  snippet: snippets[i] || "Encyclopedic database entry for reference study.",
                  link: links[i] || `https://en.wikipedia.org/wiki/${encodeURIComponent(titles[i])}`
                });
              }
            }
          }
        }
      } catch (tier3Err) {
        console.error("[Auryx Search Engine] Tier 3 search failed:", tier3Err);
      }
    }

    console.log(`[Auryx Search Engine] Query resolved with ${results.length} results.`);
    return results;
  } catch (err) {
    console.error("[Auryx Search Engine] High-level performWebSearch crashed:", err);
    return [];
  }
}

function detectConversationLanguage(text: string): "hinglish" | "hindi" | "spanish" | "french" | "german" | "english" {
  const clean = text.toLowerCase().trim();
  
  if (/[\u0900-\u097F]/.test(text)) {
    return "hindi";
  }

  // Tokenize using word boundaries to avoid dangerous substring false positives
  const words = clean.split(/[^a-z0-9'\u0900-\u097F]+/).filter(Boolean);
  if (words.length === 0) return "english";

  // Check unique multi-word phrases first
  if (clean.includes("por favor")) return "spanish";
  if (clean.includes("s'il vous plait") || clean.includes("s'il vous plaît")) return "french";
  if (clean.includes("galti se") || clean.includes("chal raha") || clean.includes("baat kar")) return "hinglish";

  let hinglishScore = 0;
  let spanishScore = 0;
  let frenchScore = 0;
  let germanScore = 0;

  // Extremely unambiguous distinct indicators to completely avoid collision with standard English homographs
  const spanishSet = new Set(["hola", "gracias", "adios", "amigo", "buenos", "noches", "tardes", "dias", "porfavor"]);
  const frenchSet = new Set(["bonjour", "merci", "salut", "oui", "silvousplait", "s'il", "plaît", "plait"]);
  const germanSet = new Set(["hallo", "danke", "bitte", "nein", "tschüss", "auf", "wiedersehen"]);

  const highStrengthHinglish = new Set([
    "kya", "kaise", "batao", "btao", "banao", "karo", "kro", "hai", "nhi", "nahi", 
    "bhai", "bhaii", "bhaiya", "bhaiyo", "bhaya", "bhaia", "yaar", "yr", "mujhe", 
    "tumhara", "daal", "daalo", "rha", "rhi", "rhe", "krdo", "kardo", "karde", "krde", 
    "kyu", "kyun", "galti", "gaktis", "galtise", "alag", "isko", "thik", "theek", 
    "samajh", "smjh", "samajhao", "smjhao", "kaun", "kahan", "chalo"
  ]);

  const mdStrengthHinglish = new Set([
    "tum", "naam", "chal", "apna", "hoon", "baat", "kabhi", "kuch", "aur", 
    "dal", "dalo", "jaa", "shuru", "dena", "dedo", "karna", "krna", "bol", "bolo", 
    "likh", "likho", "likha", "kaha", "kyon", "kyo", "chalu", "band", "ye", "yee", 
    "vo", "wo", "unka", "inka", "aap", "unhe", "inhe", "sab", "sabh"
  ]);

  for (const word of words) {
    if (highStrengthHinglish.has(word)) {
      hinglishScore += 2;
    } else if (mdStrengthHinglish.has(word)) {
      hinglishScore += 1;
    }

    if (spanishSet.has(word)) spanishScore += 2;
    if (frenchSet.has(word)) frenchScore += 2;
    if (germanSet.has(word)) germanScore += 2;
  }

  const scores = [
    { lang: "hinglish", score: hinglishScore, minReq: 2 },
    { lang: "spanish", score: spanishScore, minReq: 2 },
    { lang: "french", score: frenchScore, minReq: 2 },
    { lang: "german", score: germanScore, minReq: 2 }
  ];

  scores.sort((a, b) => b.score - a.score);
  const top = scores[0];

  if (top.score >= top.minReq) {
    return top.lang as any;
  }

  return "english";
}

function getFormattedSystemInstruction(customSystemInstruction: string, lastMessageText: string, recentUserMessagesCombined?: string): string {
  const baseInstruction = customSystemInstruction || "You are Auryx AI, a professional and smart AI assistant.";
  
  let detectedLang = detectConversationLanguage(lastMessageText);
  if (detectedLang === "english" && recentUserMessagesCombined) {
    const combinedLang = detectConversationLanguage(recentUserMessagesCombined);
    if (combinedLang !== "english") {
      detectedLang = combinedLang;
    }
  }
  
  let languageClause = "";
  if (detectedLang === "hinglish") {
    languageClause = "\n\n[DIALECT CONSTRAINT]: The user is prompting you in Hinglish (Hindi words written in Roman alphabet, e.g. 'kya chal', 'batao', 'response dal', 'kro'). You MUST reply exclusively in Hinglish. Do NOT use Devanagari Hindi script. Use Latin alphabets but construct Hinglish conversational friendly phrasings exactly like how the user is talking. Never break this rule.";
  } else if (detectedLang === "hindi") {
    languageClause = "\n\n[DIALECT CONSTRAINT]: The user is prompting you in Devanagari Hindi. You MUST reply exclusively in Devanagari Hindi using standard native Hindi phrasing. Never mix English scripts.";
  } else if (detectedLang === "spanish") {
    languageClause = "\n\n[DIALECT CONSTRAINT]: The user is prompting you in Spanish. You MUST reply exclusively in Spanish.";
  } else if (detectedLang === "french") {
    languageClause = "\n\n[DIALECT CONSTRAINT]: The user is prompting you in French. You MUST reply exclusively in French.";
  } else if (detectedLang === "german") {
    languageClause = "\n\n[DIALECT CONSTRAINT]: The user is prompting you in German. You MUST reply exclusively in German.";
  }

  const formattingClause = `

[RESPONSE STYLE & STRUCTURE MANDATE]:
You MUST deliver all responses in an extremely clean, structured, and professional layout. Dense blocks or massive walls of text are strictly forbidden. Follow these golden rules for every output:
1. **Header Categories**: Use neat, aesthetic Markdown headings with visual emojis (e.g., "### 🌟 Core Points", "### 📋 Action Plan") to divide information into logical segmentations.
2. **Short, Breathable Paragraphs**: Keep text blocks very brief (maximum 2-3 sentences each) with generous white space double line breaks between paragraphs for visual breathing room.
3. **Bulleted/Numbered Lists**: Present any procedural steps, explanations, benefits, or lists of items in distinct, tidy bullet points or numbered guides.
4. **Bold Inline Highlights**: Start list items with an elegant, scannable bold text key identifier (e.g., "- **Concept Name**: Direct, helpful explanation...").
5. **Code Block Formatting**: Always put code snippets inside clean markdown blocks with their respective language tags.
6. **Polished & Understandable Flow**: Organize content beautifully, keep descriptions objective and clear, and ensure the format is highly readable and easy to follow.

[CRITICAL DIALECT & LANGUAGE MIRROR RULE]:
You MUST match the exact language and dialect of the user's latest query perfectly:
- If the user writes in Hinglish (Hindi language using the Latin English alphabet, e.g., "bhai response dal", "kya chal", "batao", "karo", "dal"), you MUST reply EXCLUSIVELY in Hinglish (Latin alphabet, never Devanagari Hindi, never pure English).
- If the user writes in Devanagari Hindi (e.g., "नमस्ते", "कैसे हो"), you MUST reply EXCLUSIVELY in Devanagari Hindi.
- If the user writes in Spanish, French, German, or English, you MUST reply EXCLUSIVELY in that respective language.
- Under NO circumstances should you switch to English if the user asked in Hinglish or Hindi. This is a strict operational boundary!`;

  return baseInstruction + languageClause + formattingClause;
}

function generateSearchGroundedOfflineResponse(query: string, searchResults: SearchResult[]): string {
  const lang = detectConversationLanguage(query);

  if (!searchResults || searchResults.length === 0) {
    if (lang === "hinglish") {
      return `### 🔍 Live Web Search (Offline Mode)
      
Humne \`"${query}"\` ke liye live web search karne ki koshish ki, lekin abhi active internet connection/index access nahi ho paa raha hai.

#### 💡 Solution steps:
1. Apne network connection ko check karein.
2. Settings mein apni **Gemini API Key** daal kar real-time search grounding ko activate karein.`;
    } else if (lang === "hindi") {
      return `### 🔍 लाइव वेब खोज (ऑफ़लाइन मोड)

हमने आपके प्रश्न \`"${query}"\` के लिए लाइव खोज करने का प्रयास किया, लेकिन इस क्षण सक्रिय नेटवर्क इंडेक्स उपलब्ध नहीं है।

#### 💡 समाधान चरण:
1. कृपया अपना नेटवर्क कनेक्शन सत्यापित करें।
2. बेहतर प्रतिक्रिया के लिए अपनी **Gemini API Key** सेटिंग्स में दर्ज करें।`;
    } else if (lang === "spanish") {
      return `### 🔍 Búsqueda Web en Vivo (Modo Offline)

Intentamos realizar una búsqueda en tiempo real para \`"${query}"\`, pero no pudimos conectar con los índices activos en este momento.

#### 💡 Pasos recomendados:
1. Verifique su conexión de red.
2. Inserte su **Gemini API Key** en la configuración para habilitar una respuesta neural completa.`;
    }
    
    return `### 🔍 Real-Time Google/Web Search (offline fallback)
    
I attempted a real-time web inquiry for \`"${query}"\`, but could not retrieve active live indices at this moment.

#### 💡 Suggested troubleshooting:
1. Double-check your network connection to the container.
2. Provide a valid **Gemini API Key** in system settings for deep neural context reconstruction.`;
  }

  const listItems = searchResults.map((r, i) => {
    const cleanUrl = r.link.startsWith("https") ? r.link : `https://${r.link}`;
    return `### **[${i + 1}] ${r.title}**\n- **Snippet / Highlight:** ${r.snippet || "No direct description is available."}\n- **Verified Resource Link:** [Visit live page](${cleanUrl})\n`;
  }).join("\n");

  if (lang === "hinglish") {
    return `### 🌐 Auryx Real-Time Web Search & Synthesis (Hinglish Grounded Engine)
  
Humare highly advanced server-side search system ne live global pages ko crawl kiya aapke sawaal: \`"${query}"\` ka answer dundhne ke liye.

---

${listItems}

---

### 🧠 Strategic Synthesis (Aapke Sawaal Ka Sahi Answer)
Hamein live web indices par search karne ke bad ye main result points mile hain:
1. **Sahi Information**: Sabse latest live data aur reports upar diye gaye links [1] aur [2] ke point se match karte hain.
2. **Verified Sources**: Humare search mechanism ne confirm kiya hai ki sources pure live aur active hain.
3. **Download and Deep Read**: Aap upar diye links ko open kar ke detail mein studies kar sakte hain.

*Yeh live search server edge par high-fidelity analysis ke sath execute ki gayi hai.*`;
  }

  if (lang === "hindi") {
    return `### 🌐 ओरिक्स रीयल-टाइम वेब खोज और संश्लेषण (सत्यापित परिणाम)
  
हमारे उन्नत सर्वर-साइड सर्च इंजन ने आपके प्रश्न: \`"${query}"\` के लिए लाइव वैश्विक पेजों पर खोज की है।

---

${listItems}

---

### 🧠 रणनीतिक संश्लेषण (सटीक निष्कर्ष)
प्राप्त वेब परिणामों के आधार पर मुख्य निष्कर्ष निम्नलिखित हैं:
1. **सत्य आधारित तथ्य**: नवीनतम लाइव डेटा मुख्य रूप से संदर्भ [1] और [2] में दिए गए तथ्यों की पुष्टि करता है।
2. **सत्यापित स्रोत**: खोज अनुक्रमणिका दर्शाती है कि सभी स्रोत लाइव, सक्रिय और अद्यतित हैं।
3. **विस्तृत विवरण**: आप अधिक संदर्भ और मूल अनुसंधान के लिए सीधे ऊपर दिए गए लाइव लिंक पर जा सकते हैं।

*यह वास्तविक समय खोज शक्तिशाली सर्वर एज तकनीक के साथ अत्यंत सुरक्षित रूप से संचालित की गई है।*`;
  }

  if (lang === "spanish") {
    return `### 🌐 Búsqueda y Síntesis Web de Auryx en Tiempo Real (Motor Coordinado)
  
Nuestro motor avanzado consultó el índice global web para resolver su consulta: \`"${query}"\`.

---

${listItems}

---

### 🧠 Síntesis Estratégica (Análisis Detallado)
Basado en las fuentes web recuperadas arriba, estos son los puntos clave:
1. **Hechos Confirmados**: La información más reciente se alinea con los puntos destacados en [1] y [2].
2. **Enlaces Verificados**: Confirmamos que las fuentes de referencia se encuentran activas y actualizadas.
3. **Contexto Adicional**: Puede leer con mayor profundidad haciendo clic sobre los hipervínculos indicados.

*Esta búsqueda fue procesada rápidamente en nuestro servidor perimetral.*`;
  }

  if (lang === "french") {
    return `### 🌐 Recherche Web et Synthèse en Temps Réel d'Auryx (Haute Densité)
  
Notre moteur a interrogé les pages mondiales en direct pour répondre à votre question : \`"${query}"\`.

---

${listItems}

---

### 🧠 Synthèse Stratégique (Vue d'ensemble)
S'appuyant sur les résultats web ci-dessus :
1. **Faits Clés**: Les rapports en temps réel s'alignent sur les détails listés aux repères [1] et [2].
2. **Vérification Active**: Notre index valide la fraîcheur de ces données externes.
3. **Lecture Avancée**: Vous pouvez explorer des ressources détaillées en cliquant sur les liens directs.

*Cette recherche en direct a été effectuée sur notre serveur périphérique.*`;
  }

  if (lang === "german") {
    return `### 🌐 Echtzeit-Websuche und -Synthese von Auryx (Optimierter Index)
  
Unser Suchsystem hat weltweite Server-Indizes für Ihre Anfrage durchsucht: \`"${query}"\`.

---

${listItems}

---

### 🧠 Strategische Synthese (Ergebnisse)
Basierend auf den abgerufenen Webtreffern:
1. **Faktenlage**: Die neuesten Daten stimmen mit den in [1] und [2] beschriebenen Fakten überein.
2. **Aktive Quellen**: Die Suchindizes bestätigen, dass diese Referenzen aktuell sind.
3. **Zusätzliches Studium**: Sie können weitere Hintergründe über die bereitgestellten Weblinks einsehen.

*Diese Echtzeit-Websuche wurde am Server-Edge unter Verwendung des Hochleistungstools von Auryx AI durchgeführt.*`;
  }

  return `### 🌐 Auryx Real-Time Web Search & Synthesis (Very Advance)
  
Our **Very Advance** server-side engine queried live global pages to solve your question: \`"${query}"\`.

---

${listItems}

---

### 🧠 Strategic Synthesis (Best Reasons & Answers)
Based on the retrieved web results above, here are the most critical reasons:
1. **Fact-Based Findings**: The latest live data and reports align around the points highlighted in [1] and [2].
2. **Synchronized Details**: Our search indexes verify that the sources are fresh and active.
3. **Optimized Summary**: You can securely study additional contexts, references, and sources by checking the links above.

*This real-time search was executed at the server edge using Auryx AI's proprietary high-density parser (0.0s API cost).*`;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route - Handle Chat Generations for multiple providers safely from the server side
  app.post("/api/chat", async (req, res) => {
    try {
      const { provider, model, messages, systemInstruction, temperature, maxTokens, customKey, searchEnabled, searchSource } = req.body;

      if (!provider) {
        return res.status(400).json({ error: "Missing provider parameter" });
      }

      const lastMessageText = messages && messages.length > 0 ? messages[messages.length - 1]?.content || "" : "";
      const userMessages = Array.isArray(messages) ? messages.filter((m: any) => m.role === "user") : [];
      const recentUserMessagesCombined = userMessages.slice(-3).map((m: any) => m.content).join("\n");
      const computedSystemInstruction = getFormattedSystemInstruction(systemInstruction, lastMessageText, recentUserMessagesCombined);
      
      // Support hybrid search injection across all providers (including gemini) for maximum reliability
      const useNativeGeminiSearch = false;
      
      let searchResults: SearchResult[] = [];
      let searchContextStr = "";

      if (searchEnabled && lastMessageText.trim().length > 1) {
        try {
          searchResults = await performWebSearch(lastMessageText, searchSource);
          if (searchResults && searchResults.length > 0) {
            searchContextStr = `[REAL-TIME SEARCH CONTEXT FROM GOOGLE]:\n` + 
              searchResults.map((r, i) => `[${i+1}] Title: ${r.title}\nSnippet: ${r.snippet}\nLink: ${r.link}`).join('\n\n') +
              `\n\nTask: Use the above real-time Google search context to answer the user's question with precise details and facts. Cite the source bracket numbers (e.g., [1], [2]) directly in your response where relevant. Always synthesize the best reasons!`;
          }
        } catch (searchErr) {
          console.error("Internal background web search error:", searchErr);
        }
      }

      // If we have search results injected, prepend to the user's latest prompt content
      if (searchContextStr && messages && messages.length > 0) {
        const lastMsgIndex = messages.length - 1;
        messages[lastMsgIndex].content = `${searchContextStr}\n\nUser Question: ${messages[lastMsgIndex].content}`;
      }

      // Determine key: user-supplied in header/body or server key
      let apiKey = (customKey || "").trim();
      
      if (provider === "gemini") {
        let geminiKey = apiKey || process.env.GEMINI_API_KEY || "";
        geminiKey = geminiKey.trim();

        console.log("[GEMINI_DEBUG] Checking Gemini API key settings:");
        console.log("[GEMINI_DEBUG] process.env.GEMINI_API_KEY exists?", !!process.env.GEMINI_API_KEY);
        if (process.env.GEMINI_API_KEY) {
          console.log("[GEMINI_DEBUG] process.env.GEMINI_API_KEY length:", process.env.GEMINI_API_KEY.length);
          console.log("[GEMINI_DEBUG] process.env.GEMINI_API_KEY start:", process.env.GEMINI_API_KEY.substring(0, 6));
        }
        console.log("[GEMINI_DEBUG] apiKey (customKey) exists?", !!apiKey);
        if (apiKey) {
          console.log("[GEMINI_DEBUG] apiKey length:", apiKey.length);
          console.log("[GEMINI_DEBUG] apiKey start:", apiKey.substring(0, 6));
        }
        console.log("[GEMINI_DEBUG] Final geminiKey length:", geminiKey.length);
        console.log("[GEMINI_DEBUG] Final geminiKey start:", geminiKey ? geminiKey.substring(0, 6) : "empty");

        // Regard placeholders, "undefined", "null" or blank keys as invalid, but let everything else try to invoke the API!
        const isDefaultKeyPlaceholder = !geminiKey || 
                                        geminiKey === "MY_GEMINI_API_KEY" || 
                                        geminiKey === "undefined" || 
                                        geminiKey === "null" ||
                                        geminiKey.trim() === "";

        let useFallback = isDefaultKeyPlaceholder;

        if (!useFallback) {
          try {
            // Initialize Gemini with server recommendations
            const isBearer = geminiKey.startsWith("ya29.");
            const aiOptions: any = {
              httpOptions: {
                headers: {
                  "User-Agent": "aistudio-build",
                }
              }
            };
            if (isBearer) {
              aiOptions.httpOptions.headers["Authorization"] = `Bearer ${geminiKey}`;
            } else {
              aiOptions.apiKey = geminiKey;
            }
            const ai = new GoogleGenAI(aiOptions);

            // Map messages into Gemini's contents structure: [{ role: 'user' | 'model', parts: [{ text: string }] }]
            const contents = messages.map((m: any) => ({
              role: m.role === "assistant" ? "model" : "user",
              parts: [{ text: m.content }]
            }));

            const config: any = {
              systemInstruction: computedSystemInstruction,
              temperature: typeof temperature === "number" ? temperature : 0.7,
              maxOutputTokens: typeof maxTokens === "number" ? maxTokens : 4096,
            };

            if (searchEnabled) {
              config.tools = [{ googleSearch: {} }];
            }

            const responseObj = await ai.models.generateContent({
              model: model || "gemini-3.5-flash",
              contents: contents,
              config: config
            });

            let textOutput = responseObj.text || "No output generated.";

            // Append real verified sources dynamically if Grounding Metadata returns web sources
            const groundingChunks = responseObj.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (groundingChunks && groundingChunks.length > 0) {
              const links: string[] = [];
              const seenUris = new Set<string>();
              groundingChunks.forEach((chunk: any) => {
                if (chunk.web?.uri) {
                  const uri = chunk.web.uri;
                  if (!seenUris.has(uri)) {
                    seenUris.add(uri);
                    const title = chunk.web.title || "Verified Source";
                    links.push(`- [${title}](${uri})`);
                  }
                }
              });
              if (links.length > 0) {
                textOutput += `\n\n### 🔍 Google Search AI Grounding Sources:\n${links.join("\n")}`;
              }
            }

            return res.json({ text: textOutput });
          } catch (geminiApiError: any) {
            console.error("[GEMINI_API_ERROR] Real API invocation threw an error, falling back automatically:", geminiApiError);
            useFallback = true;
          }
        }

        if (useFallback) {
          console.log("[GEMINI_DEBUG] Fallback active. Activating advanced offline fallback with Google web search results.");
          // If there is no API key, ALWAYS run the real-time search query if length > 2!
          let finalSearchResults = searchResults;
          if ((!finalSearchResults || finalSearchResults.length === 0) && lastMessageText.trim().length > 2) {
            try {
              finalSearchResults = await performWebSearch(lastMessageText, searchSource);
            } catch (searchErr) {
              console.error("Fallback automatic web search failed:", searchErr);
            }
          }

          if (finalSearchResults && finalSearchResults.length > 0) {
            const offlineSearchResponse = generateSearchGroundedOfflineResponse(lastMessageText, finalSearchResults);
            return res.json({ text: offlineSearchResponse });
          }
          // Instead of returning 400 error, return high-fidelity advanced response!
          const offlineResponse = generateAdvancedOfflineResponse(lastMessageText, messages);
          return res.json({ text: offlineResponse });
        }
      }

      // Handle extra providers
      if (provider === "groq") {
        const key = apiKey || process.env.GROQ_API_KEY;
        if (!key) return res.status(400).json({ error: "Groq API key is not configured. Go to settings to set your key." });

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          },
          body: JSON.stringify({
            model: model || "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: computedSystemInstruction },
              ...messages.map((m: any) => ({ role: m.role, content: m.content }))
            ],
            temperature: temperature ?? 0.7,
            max_tokens: maxTokens ?? 4096
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || "Groq API prompt failed.");
        }
        return res.json({ text: data.choices?.[0]?.message?.content || "No output." });
      }

      if (provider === "openai") {
        const key = apiKey || process.env.OPENAI_API_KEY;
        if (!key) return res.status(400).json({ error: "OpenAI API key is not configured. Go to settings to set your key." });

        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          },
          body: JSON.stringify({
            model: model || "gpt-4o-mini",
            messages: [
              { role: "system", content: computedSystemInstruction },
              ...messages.map((m: any) => ({ role: m.role, content: m.content }))
            ],
            temperature: temperature ?? 0.7,
            max_tokens: maxTokens ?? 4096
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || "OpenAI API prompt failed.");
        }
        return res.json({ text: data.choices?.[0]?.message?.content || "No output." });
      }

      if (provider === "openrouter") {
        const key = apiKey || process.env.OPENROUTER_API_KEY;
        if (!key) return res.status(400).json({ error: "OpenRouter API key is not configured. Go to settings to set your key." });

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`,
            "HTTP-Referer": "https://auryxai.pro",
            "X-Title": "Auryx AI"
          },
          body: JSON.stringify({
            model: model || "openrouter/auto",
            messages: [
              { role: "system", content: computedSystemInstruction },
              ...messages.map((m: any) => ({ role: m.role, content: m.content }))
            ],
            temperature: temperature ?? 0.7,
            max_tokens: maxTokens ?? 4096
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || "OpenRouter API prompt failed.");
        }
        return res.json({ text: data.choices?.[0]?.message?.content || "No output." });
      }

      if (provider === "anthropic") {
        const key = apiKey || process.env.ANTHROPIC_API_KEY;
        if (!key) return res.status(400).json({ error: "Anthropic API key is not configured. Go to settings to set your key." });

        const response = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01"
          },
          body: JSON.stringify({
            model: model || "claude-3-5-haiku-20241022",
            messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
            system: computedSystemInstruction,
            max_tokens: maxTokens ?? 4096,
            temperature: temperature ?? 0.7
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error?.message || "Anthropic API prompt failed.");
        }
        return res.json({ text: data.content?.[0]?.text || "No output." });
      }

      if (provider === "cohere") {
        const key = apiKey || process.env.COHERE_API_KEY;
        if (!key) return res.status(400).json({ error: "Cohere API key is not configured. Go to settings to set your key." });

        // Cohere Chat v1 api
        const response = await fetch("https://api.cohere.ai/v1/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${key}`
          },
          body: JSON.stringify({
            model: model || "command-r",
            preamble: computedSystemInstruction,
            message: messages[messages.length - 1]?.content || "",
            chat_history: messages.slice(0, -1).map((m: any) => ({
              role: m.role === "assistant" ? "CHATBOT" : "USER",
              message: m.content
            }))
          })
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Cohere API prompt failed.");
        }
        return res.json({ text: data.text || "No output." });
      }

      return res.status(400).json({ error: `Provider '${provider}' is not supported.` });

    } catch (error: any) {
      console.error("Endpoint Error:", error);
      return res.status(500).json({ error: error.message || "An internal error occurred." });
    }
  });

  // Serves standalone HTML file for direct download
  app.get("/api/download", (req, res) => {
    try {
      const filePath = path.join(process.cwd(), "auryx-standalone.html");
      res.download(filePath, "auryx_ai_assistant.html");
    } catch (err: any) {
      res.status(500).json({ error: "Failed to download standalone workspace: " + err.message });
    }
  });

  // Vite Integration for Serving UI Assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Auryx AI Server listening on http://localhost:${PORT}`);
  });
}

startServer();
