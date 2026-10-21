import { Check, X, Info } from "lucide-react";
import { motion } from "framer-motion";
import type { Analysis } from "../services/analyzeNetwork";
import { resultLabels, shortResultLabels } from "../data/analysisLabels";
export function EulerianResult({ analysis: a }: { analysis: Analysis | null }) {
  const success = !!a?.route && a.validation?.valid;
  const Icon = success ? Check : a?.kind === "none" ? X : Info;
  return (
    <motion.div
      key={a?.kind ?? "pending"}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`eulerian-result ${success ? "success" : a?.kind === "none" ? "failure" : "pending"}`}
      aria-live="polite"
    >
      <div className="result-symbol">
        <Icon size={30} />
      </div>
      <div>
        <h3 aria-label={a ? resultLabels[a.kind] : "Pronta para analisar"}>
          {a ? shortResultLabels[a.kind] : "Pronta para analisar"}
        </h3>
        <p>
          {a
            ? a.explanation
            : "Crie ou carregue um grafo e execute a análise para descobrir se existe um percurso Euleriano."}
        </p>
      </div>
    </motion.div>
  );
}
