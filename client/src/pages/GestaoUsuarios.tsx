import { useState } from "react";
import { trpc } from "@/lib/trpc";
import SaasDashboardLayout from "@/components/SaasDashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { UserPlus, Shield, User, Wrench, Building2, ToggleLeft, ToggleRight } from "lucide-react";

const ROLE_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  superadmin: { label: "Super Admin", color: "bg-purple-900/40 text-purple-300 border-purple-700", icon: <Shield className="w-3 h-3" /> },
  admin: { label: "Admin", color: "bg-red-900/40 text-red-300 border-red-700", icon: <Shield className="w-3 h-3" /> },
  tecnico: { label: "Técnico", color: "bg-blue-900/40 text-blue-300 border-blue-700", icon: <Wrench className="w-3 h-3" /> },
  cliente: { label: "Cliente", color: "bg-slate-700/40 text-slate-300 border-slate-600", icon: <Building2 className="w-3 h-3" /> },
};

export default function GestaoUsuarios() {
  const [openCreate, setOpenCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "tecnico" as "superadmin" | "admin" | "tecnico" | "cliente", companyId: "" });

  const utils = trpc.useUtils();
  const { data: users = [], isLoading } = trpc.saas.users.list.useQuery();

  const createUser = trpc.saas.users.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      utils.saas.users.list.invalidate();
      setOpenCreate(false);
      setForm({ name: "", email: "", password: "", role: "tecnico", companyId: "" });
    },
    onError: (e) => toast.error(e.message),
  });

  const updateRole = trpc.saas.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado!");
      utils.saas.users.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleActive = trpc.saas.users.toggleActive.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado!");
      utils.saas.users.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    createUser.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      companyId: form.companyId ? Number(form.companyId) : undefined,
    });
  }

  return (
    <SaasDashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white font-['Barlow_Condensed'] tracking-wide uppercase">
              Gestão de Usuários
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Cadastre técnicos, administradores e clientes do OPERIS
            </p>
          </div>
          <Dialog open={openCreate} onOpenChange={setOpenCreate}>
            <DialogTrigger asChild>
              <Button className="bg-[#C8102E] hover:bg-red-700 text-white gap-2">
                <UserPlus className="w-4 h-4" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#0d1f35] border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="font-['Barlow_Condensed'] text-xl uppercase tracking-wide">
                  Cadastrar Novo Usuário
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-2">
                <div className="space-y-1">
                  <Label className="text-slate-300 text-sm">Nome completo</Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    placeholder="João da Silva"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300 text-sm">E-mail</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    placeholder="joao@empresa.com"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300 text-sm">Senha (mínimo 6 caracteres)</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300 text-sm">Perfil de acesso</Label>
                  <Select value={form.role} onValueChange={v => setForm(f => ({ ...f, role: v as typeof form.role }))}>
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="tecnico" className="text-white">Técnico — realiza inspeções</SelectItem>
                      <SelectItem value="admin" className="text-white">Admin — gerencia tudo</SelectItem>
                      <SelectItem value="cliente" className="text-white">Cliente — visualiza laudos</SelectItem>
                      <SelectItem value="superadmin" className="text-white">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-slate-300 text-sm">ID da Empresa (opcional)</Label>
                  <Input
                    type="number"
                    value={form.companyId}
                    onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}
                    placeholder="Ex: 1"
                    className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={createUser.isPending} className="flex-1 bg-[#C8102E] hover:bg-red-700 text-white">
                    {createUser.isPending ? "Criando..." : "Criar Usuário"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setOpenCreate(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Cancelar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(ROLE_LABELS).map(([role, { label, icon }]) => {
            const count = users.filter(u => u.role === role).length;
            return (
              <div key={role} className="bg-[#0d1f35] border border-slate-700/50 rounded-lg p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                  {icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-white font-['Barlow_Condensed']">{count}</p>
                  <p className="text-xs text-slate-400">{label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-[#0d1f35] border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Todos os Usuários ({users.length})
            </h2>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Carregando...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <User className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">Nenhum usuário cadastrado ainda.</p>
              <p className="text-slate-500 text-sm mt-1">Clique em "Novo Usuário" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700/50 hover:bg-transparent">
                  <TableHead className="text-slate-400 font-medium">Nome</TableHead>
                  <TableHead className="text-slate-400 font-medium">E-mail</TableHead>
                  <TableHead className="text-slate-400 font-medium">Perfil</TableHead>
                  <TableHead className="text-slate-400 font-medium">Empresa</TableHead>
                  <TableHead className="text-slate-400 font-medium">Status</TableHead>
                  <TableHead className="text-slate-400 font-medium text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => {
                  const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.cliente;
                  return (
                    <TableRow key={user.id} className="border-slate-700/30 hover:bg-slate-800/30">
                      <TableCell className="text-white font-medium">{user.name}</TableCell>
                      <TableCell className="text-slate-300 text-sm">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={`${roleInfo.color} border text-xs gap-1 flex items-center w-fit`}>
                          {roleInfo.icon}
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-400 text-sm">
                        {user.companyId ? `Empresa #${user.companyId}` : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={user.active
                          ? "bg-green-900/40 text-green-300 border border-green-700 text-xs"
                          : "bg-slate-700/40 text-slate-400 border border-slate-600 text-xs"
                        }>
                          {user.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Alterar role */}
                          <Select
                            value={user.role}
                            onValueChange={v => updateRole.mutate({ id: user.id, role: v as "superadmin" | "admin" | "tecnico" | "cliente" })}
                          >
                            <SelectTrigger className="h-7 w-28 bg-slate-800 border-slate-600 text-slate-300 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                              <SelectItem value="tecnico" className="text-white text-xs">Técnico</SelectItem>
                              <SelectItem value="admin" className="text-white text-xs">Admin</SelectItem>
                              <SelectItem value="cliente" className="text-white text-xs">Cliente</SelectItem>
                              <SelectItem value="superadmin" className="text-white text-xs">Super Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Toggle ativo */}
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-slate-400 hover:text-white"
                            onClick={() => toggleActive.mutate({ id: user.id, active: !user.active })}
                            title={user.active ? "Desativar usuário" : "Ativar usuário"}
                          >
                            {user.active
                              ? <ToggleRight className="w-5 h-5 text-green-400" />
                              : <ToggleLeft className="w-5 h-5 text-slate-500" />
                            }
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </SaasDashboardLayout>
  );
}
