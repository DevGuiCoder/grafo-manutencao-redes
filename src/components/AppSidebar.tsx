import { useState } from "react";
import { Menu, ArrowUpRight } from "lucide-react";
import { Modal } from "./Modal";
export function AppSidebar({ action }: { action: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const choose = (id: string) => {
    setOpen(false);
    action(id);
  };
  return (
    <>
      <aside className="app-rail" aria-label="Barra de navegação">
        <button
          className="rail-menu"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu size={22} />
        </button>
      </aside>
      {open && (
        <Modal
          title="Grafo de Manutenção de Redes"
          close={() => setOpen(false)}
          className="navigation-overlay"
        >
          <p className="nav-intro">Análise e Otimização de Redes</p>
          <nav aria-label="Navegação principal">
            {[
              { id: "overview", label: "Mapa de Rede" },
              { id: "reports", label: "Relatórios" },
              { id: "scenarios", label: "Cenários" },
              { id: "import", label: "Importar" },
              { id: "export", label: "Exportar" },
            ].map((item) => (
              <button
                key={item.label}
                className={
                  item.id === "overview" ? "nav-entry current" : "nav-entry"
                }
                aria-current={item.id === "overview" ? "page" : undefined}
                onClick={() => choose(item.id)}
              >
                <span>{item.label}</span>
                <ArrowUpRight size={19} />
              </button>
            ))}
          </nav>
          <p className="nav-footnote">Grafo não direcionado · Não ponderado</p>
        </Modal>
      )}
    </>
  );
}
