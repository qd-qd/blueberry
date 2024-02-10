import { Buffer } from "node:buffer";
import { writeFile } from "node:fs/promises";

// @dev this file generate the rules that would be embed in the extension

const explorersToMock = [
  { url: "https://etherscan.io", id: "eth" },
  { url: "https://arbiscan.io", id: "arb" },
  { url: "https://optimistic.etherscan.io", id: "opt" },
  { url: "https://scrollscan.com", id: "scroll" },
  { url: "https://basescan.org", id: "base" },
];
const mockingPages = [
  { origin: "address", target: "address" },
  { origin: "tx", target: "tx" },
  { origin: "block", target: "<explorer.id>/block" },
];

const generateRule = (id, page, explorer) => {
  const target = page.target.replace("<explorer.id>", explorer.id);

  return {
    id,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        regexSubstitution: `https://parsec.fi/${target}/\\1?chain=${explorer.id}`,
      },
    },
    condition: {
      regexFilter: `^${explorer.url}/${page.origin}/(.*)`,
      resourceTypes: ["main_frame"],
    },
  };
};

function* createId() {
  let index = 1;
  while (true) {
    yield index++;
  }
}

const generateRules = () => {
  let rules = [];
  let index = createId();

  for (let i = 0; i < mockingPages.length; i++) {
    // get the page to mock
    const page = mockingPages[i];

    for (let j = 0; j < explorersToMock.length; j++) {
      const explorerToMock = explorersToMock[j];

      // push the rule that mock a specific page to a specific explorer
      rules.push(generateRule(index.next().value, page, explorerToMock));
    }
  }

  return rules;
};

(async function main() {
  try {
    // generate the rules
    const rules = generateRules();

    // write the rules to a file
    const data = new Uint8Array(Buffer.from(JSON.stringify(rules)));
    await writeFile("rules.json", data);
    console.log(`✅ rules generated`);
    console.info(JSON.stringify(rules, null, 2));
  } catch (error) {
    console.error(`❌ there was an error: ${error.message}`);
  }
})();
