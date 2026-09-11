"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { isGenericPlanTitle } from "@/lib/ai/local-plan-parser";
import { intencoes, vibes, type Intencao, type Vibe } from "@/lib/domain/schemas";
import { usePonto } from "@/lib/store/ponto-store";
import { ArrowLeft, ArrowRight, Eye, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

export default function ReviewPlanPage() {
  const router = useRouter();
  const { parsedDraft, draftSource, currentGroup, publishPlan } = usePonto();
  const [intencao, setIntencao] = useState<Intencao>(
    parsedDraft?.intencao ?? "Conhecer pessoas novas",
  );
  const [vibe, setVibe] = useState<Vibe>(
    parsedDraft?.vibe ?? "Qualquer uma",
  );

  if (!parsedDraft || !currentGroup) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardContent className="space-y-4 pt-6 text-center">
          <h1 className="text-xl font-semibold">Ainda não há um plano para rever</h1>
          <p className="text-sm text-muted-foreground">
            Escreve primeiro o que vos apetece fazer.
          </p>
          <Button asChild>
            <Link href="/inicio">Voltar ao início</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const budget = String(data.get("orcamento")).trim();

    try {
      const id = await publishPlan({
        titulo: String(data.get("titulo")),
        descricao: String(data.get("descricao")),
        tipo: String(data.get("tipo")) || null,
        intencao,
        vibe,
        numeroPessoas: Number(data.get("numeroPessoas")),
        cidade: String(data.get("cidade")),
        zonaAproximada: String(data.get("zonaAproximada")) || null,
        data: String(data.get("data")),
        horaInicio: String(data.get("horaInicio")),
        horaFim: String(data.get("horaFim")),
        orcamento: budget ? Number(budget) : null,
        tags: String(data.get("tags"))
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      });
      toast.success("Plano publicado.");
      router.push(`/planos/${id}/compatibilidades`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Revê os campos antes de publicar.",
      );
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" className="-ml-2 mb-4">
        <Link href="/inicio">
          <ArrowLeft data-icon="inline-start" />
          Voltar
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Badge variant="outline" className="mb-3 text-primary">
            <Sparkles className="size-3" />
            Plano estruturado
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Confirmem os detalhes
          </h1>
          <p className="mt-2 text-muted-foreground">
            Podem editar tudo antes de publicar.
          </p>
        </div>
        <div className="rounded-lg border bg-card px-3 py-2 text-xs text-muted-foreground">
          <span className="text-foreground">Intenção:</span> {intencao}
        </div>
      </div>

      <Card className="mt-7">
        <CardHeader className="border-b">
          <CardTitle className="text-base">Texto original</CardTitle>
          <p className="text-sm font-normal leading-6 text-muted-foreground">
            “{draftSource}”
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                name="titulo"
                defaultValue={parsedDraft.titulo}
                required
                autoFocus={isGenericPlanTitle(parsedDraft.titulo)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                defaultValue={parsedDraft.descricao}
                className="min-h-24"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de plano</Label>
                <Input
                  id="tipo"
                  name="tipo"
                  defaultValue={parsedDraft.tipo ?? ""}
                  placeholder="Ex.: Book club"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="numeroPessoas">Pessoas no vosso grupo</Label>
                <Input
                  id="numeroPessoas"
                  name="numeroPessoas"
                  type="number"
                  min={2}
                  max={8}
                  defaultValue={
                    parsedDraft.numeroPessoas ?? currentGroup.numeroPessoas
                  }
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Intenção</Label>
                <Select
                  value={intencao}
                  onValueChange={(value) => setIntencao(value as Intencao)}
                >
                  <SelectTrigger className="w-full" aria-label="Intenção">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {intencoes.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Vibe</Label>
                <Select
                  value={vibe}
                  onValueChange={(value) => setVibe(value as Vibe)}
                >
                  <SelectTrigger className="w-full" aria-label="Vibe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {vibes.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cidade">Cidade</Label>
                <Input
                  id="cidade"
                  name="cidade"
                  defaultValue={parsedDraft.cidade ?? currentGroup.cidade}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zonaAproximada">
                  Zona aproximada{" "}
                  <span className="font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="zonaAproximada"
                  name="zonaAproximada"
                  defaultValue={
                    parsedDraft.zonaAproximada ??
                    currentGroup.zonaAproximada ??
                    ""
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  name="data"
                  type="date"
                  defaultValue={parsedDraft.data ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaInicio">Das</Label>
                <Input
                  id="horaInicio"
                  name="horaInicio"
                  type="time"
                  defaultValue={parsedDraft.horaInicio ?? ""}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="horaFim">Até</Label>
                <Input
                  id="horaFim"
                  name="horaFim"
                  type="time"
                  defaultValue={parsedDraft.horaFim ?? ""}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
              <div className="space-y-2">
                <Label htmlFor="orcamento">Orçamento por pessoa</Label>
                <Input
                  id="orcamento"
                  name="orcamento"
                  type="number"
                  min={0}
                  defaultValue={parsedDraft.orcamento ?? ""}
                  placeholder="€"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tags">Tags, separadas por vírgulas</Label>
                <Input
                  id="tags"
                  name="tags"
                  defaultValue={parsedDraft.tags.join(", ")}
                />
              </div>
            </div>

            <div className="flex gap-3 rounded-xl bg-primary/8 p-4 text-sm text-muted-foreground">
              <Eye className="mt-0.5 size-5 shrink-0 text-primary" />
              <p>
                Os outros grupos veem o plano e o perfil do grupo — nunca
                perfis individuais nem localização exata.
              </p>
            </div>

            <Button type="submit" className="h-12 w-full text-base">
              Publicar e ver grupos
              <ArrowRight data-icon="inline-end" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
