"use client";

import { PontoLogo } from "@/components/ponto-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { usePonto } from "@/lib/store/ponto-store";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { toast } from "sonner";

const suggestions = [
  "Livros",
  "Estudo",
  "Desporto",
  "Música",
  "Cinema",
  "Jogos",
  "Comida",
  "Cultura",
  "Conversa",
  "Natureza",
  "Tecnologia",
  "Voluntariado",
  "Noite",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { createGroup } = usePonto();
  const [interesses, setInteresses] = useState<string[]>(["Cultura", "Conversa"]);
  const [adult, setAdult] = useState(false);

  function toggleInterest(interest: string) {
    setInteresses((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const idade = Number(formData.get("idade"));
    const numeroPessoas = Number(formData.get("numeroPessoas"));

    if (!adult || idade < 18) {
      toast.error("É necessário confirmar que tens pelo menos 18 anos.");
      return;
    }
    if (numeroPessoas < 2 || numeroPessoas > 8) {
      toast.error("O grupo deve ter entre 2 e 8 pessoas.");
      return;
    }
    if (interesses.length === 0) {
      toast.error("Escolhe pelo menos um interesse.");
      return;
    }

    try {
      await createGroup({
        nomePessoa: String(formData.get("nomePessoa")),
        idade,
        cidade: String(formData.get("cidade")),
        nomeGrupo: String(formData.get("nomeGrupo")),
        descricao: String(formData.get("descricao")),
        zonaAproximada: String(formData.get("zonaAproximada")) || null,
        numeroPessoas,
        interesses,
      });
      router.push("/inicio");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível criar o grupo.",
      );
    }
  }

  return (
    <main className="min-h-svh px-4 py-5 sm:py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-7 flex items-center justify-between">
          <PontoLogo />
          <span className="text-xs text-muted-foreground">1 de 1</span>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-semibold tracking-tight">
            Criem o vosso grupo
          </h1>
          <p className="mt-2 text-muted-foreground">
            Só o essencial. Podem começar já a fazer um plano.
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={submit} className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomePessoa">O teu nome</Label>
                  <Input
                    id="nomePessoa"
                    name="nomePessoa"
                    placeholder="Ex.: Inês"
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="idade">Idade</Label>
                  <Input
                    id="idade"
                    name="idade"
                    type="number"
                    min={18}
                    max={99}
                    defaultValue={25}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    name="cidade"
                    defaultValue="Lisboa"
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
                    placeholder="Ex.: Arroios"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nomeGrupo">Nome do grupo</Label>
                <Input
                  id="nomeGrupo"
                  name="nomeGrupo"
                  placeholder="Ex.: Os do costume"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="numeroPessoas">Pessoas no grupo</Label>
                <Input
                  id="numeroPessoas"
                  name="numeroPessoas"
                  type="number"
                  min={2}
                  max={8}
                  defaultValue={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">
                  Descrição curta{" "}
                  <span className="font-normal text-muted-foreground">
                    (opcional)
                  </span>
                </Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  placeholder="Ex.: Amigos em Lisboa que gostam de descobrir sítios novos."
                  className="min-h-20"
                />
              </div>

              <fieldset>
                <legend className="text-sm font-medium">Interesses</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {suggestions.map((interest) => {
                    const selected = interesses.includes(interest);
                    return (
                      <button
                        key={interest}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleInterest(interest)}
                        className={`rounded-full border px-3 py-2 text-sm transition ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {interest}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-4">
                <Checkbox
                  checked={adult}
                  onCheckedChange={(value) => setAdult(value === true)}
                  className="mt-0.5"
                />
                <span className="text-sm leading-6">
                  Tenho mais de 18 anos{" "}
                  <span className="text-destructive">*</span>
                </span>
              </label>

              <div className="flex gap-3 rounded-xl bg-primary/8 p-4 text-sm text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                <p>
                  Os outros grupos veem apenas o perfil do grupo, a cidade e a
                  zona aproximada — nunca o teu perfil individual.
                </p>
              </div>

              <Button type="submit" className="h-12 w-full text-base">
                Criar grupo e continuar
                <ArrowRight data-icon="inline-end" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
