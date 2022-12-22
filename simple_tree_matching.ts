import fs from "fs";
import jsdom from "jsdom";
import minifier from "html-minifier";


function getDOMByFile(filepath: string) {
    const pageContent = fs.readFileSync(filepath).toString()
    const compressedHTML = minifier.minify(pageContent, {
        collapseWhitespace: true,
        removeComments: true,
        removeEmptyElements: true,
    })
    let dom = new jsdom.JSDOM(compressedHTML).window.document
    return dom
}
    

function calcNodes(dom: ChildNode | Document): number {
    const countChildren = (nodes = []) => nodes.filter((node: any) => !!node.tagName).reduce((r, n) => r + calcNodes(n), 0);
    const childNodes: any = [...dom.childNodes];
    return 1 + countChildren(childNodes);
}


function simpleTreeMatching(domA: Document, domB: Document): number {
    if (!domA || !domB) { return 0 }
    const domANodes: (HTMLElement | any)[] = [...domA.childNodes].filter((item: any) => !!item.tagName);
    const domBNodes: (HTMLElement | any)[] = [...domB.childNodes].filter((item: any) => !!item.tagName);
    const nodeA: any = domA
    const nodeB: any = domB
    if (!nodeA || !nodeB || nodeA.tagName != nodeB.tagName) {
        return 0
    } else {
        const k = domANodes.length;
        const n = domBNodes.length;

        let m = Array(k+1).fill(0);
        for (let i = 0; i < k + 1; i++) {
            m[i] = Array(n+1).fill(0)
        }

        for (let i = 1; i <= k; i++) {
            for (let j = 1; j <= n; j++) {
                m[i][j] = Math.max(m[i][j - 1], m[i - 1][j], m[i - 1][j - 1] + simpleTreeMatching(domANodes[i-1], domBNodes[j-1]))
            }
        }
        return m[k][n] + 1
    }
}



function normalizeSimpleTreeMatching(legitDOM: Document, phishingDOM: Document): number {
    return simpleTreeMatching(legitDOM, phishingDOM) / ((calcNodes(legitDOM) + calcNodes(phishingDOM)) / 2)
}



function main() {
    const legitDOM = getDOMByFile("./legit.html")
    const phishingDOM = getDOMByFile("./phishing.html")

    const legitNodeCount = calcNodes(legitDOM)
    const phishingNodeCount = calcNodes(phishingDOM)
    const STM = simpleTreeMatching(legitDOM, phishingDOM)
    const NSTM = STM / ((legitNodeCount + phishingNodeCount) / 2)

    console.log("Total nodes in Legit DOM: ", legitNodeCount)
    console.log("Total nodes in Phishing DOM: ", phishingNodeCount)
    console.log("SMT(A,B) = ", STM)
    console.log("NSMT(A,B) = ", NSTM.toFixed(2))
}

main()


