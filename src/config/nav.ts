import {
  LayoutDashboard,
  Sparkles,
  Bug,
  Workflow,
  Github,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

/** Módulos disponíveis após o login. Adicionar novos módulos aqui. */
export const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Meus projetos", to: "/projetos", icon: FolderKanban },
  { label: "Hunter", to: "/hunter", icon: Sparkles },
  { label: "Defeitos", to: "/defeitos", icon: Bug },
  { label: "Coleções", to: "/colecoes", icon: Workflow },
  { label: "Conectar repositório", to: "/conectar", icon: Github },
];
