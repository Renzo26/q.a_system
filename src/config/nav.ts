import { LayoutDashboard, Sparkles, Bug, Github, type LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

/** Módulos disponíveis após o login. Adicionar novos módulos aqui. */
export const navItems: NavItem[] = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "Argus", to: "/argus", icon: Sparkles },
  { label: "Defeitos", to: "/defeitos", icon: Bug },
  { label: "Conectar repositório", to: "/conectar", icon: Github },
];
