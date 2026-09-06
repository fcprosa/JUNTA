import type { Group, Intencao, Plan, Vibe } from "@/lib/domain/schemas";

export type GroupMatch = {
  group: Group;
  plan: Plan;
  explanation: string;
  reasons: string[];
};

const socialIntentions = new Set<Intencao>([
  "Amizade",
  "Conhecer pessoas novas",
  "Conhecer outros solteiros",
]);

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function hasTimeOverlap(left: Plan, right: Plan) {
  return (
    toMinutes(left.horaInicio) < toMinutes(right.horaFim) &&
    toMinutes(right.horaInicio) < toMinutes(left.horaFim)
  );
}

function intentionsMatch(left: Intencao, right: Intencao) {
  return left === right || (socialIntentions.has(left) && socialIntentions.has(right));
}

function vibesMatch(left: Vibe, right: Vibe) {
  return left === right || left === "Qualquer uma" || right === "Qualquer uma";
}

function sharedTerms(source: string[], target: string[]) {
  const normalizedTarget = target.map(normalize);
  return source.filter((item) => {
    const normalized = normalize(item);
    return normalizedTarget.some(
      (candidate) =>
        candidate === normalized ||
        candidate.includes(normalized) ||
        normalized.includes(candidate),
    );
  });
}

function createExplanation(
  source: Plan,
  target: Plan,
  group: Group,
  shared: string[],
) {
  const parts: string[] = [];

  if (normalize(source.tipo ?? "") === normalize(target.tipo ?? "")) {
    parts.push(`quer fazer ${target.tipo?.toLowerCase()}`);
  } else if (shared.length > 0) {
    parts.push(`partilha o interesse por ${shared.slice(0, 2).join(" e ")}`);
  } else {
    parts.push(`procura um plano com a mesma intenção`);
  }

  parts.push(`está disponível no mesmo horário`);
  parts.push(`em ${group.cidade}`);

  return `Este grupo também ${parts.join(", ")}.`;
}

export function findMatches({
  sourcePlan,
  groups,
  plans,
  blockedGroupIds = [],
}: {
  sourcePlan: Plan;
  groups: Group[];
  plans: Plan[];
  blockedGroupIds?: string[];
}): GroupMatch[] {
  const blocked = new Set(blockedGroupIds);
  const groupById = new Map(groups.map((group) => [group.id, group]));
  const sourceGroup = groupById.get(sourcePlan.groupId);

  return plans
    .flatMap((candidatePlan) => {
      const group = groupById.get(candidatePlan.groupId);
      if (
        !group ||
        !sourceGroup ||
        candidatePlan.groupId === sourcePlan.groupId ||
        blocked.has(candidatePlan.groupId) ||
        candidatePlan.status !== "ativo" ||
        group.numeroPessoas < 2 ||
        group.numeroPessoas > 8 ||
        normalize(candidatePlan.cidade) !== normalize(sourcePlan.cidade) ||
        candidatePlan.data !== sourcePlan.data ||
        !hasTimeOverlap(sourcePlan, candidatePlan) ||
        !intentionsMatch(sourcePlan.intencao, candidatePlan.intencao)
      ) {
        return [];
      }

      const shared = sharedTerms(
        [...sourcePlan.tags, ...(sourceGroup.interesses ?? [])],
        [...candidatePlan.tags, ...group.interesses],
      );
      const sameType =
        Boolean(sourcePlan.tipo && candidatePlan.tipo) &&
        normalize(sourcePlan.tipo ?? "") === normalize(candidatePlan.tipo ?? "");
      const sameZone =
        Boolean(sourcePlan.zonaAproximada && candidatePlan.zonaAproximada) &&
        normalize(sourcePlan.zonaAproximada ?? "") ===
          normalize(candidatePlan.zonaAproximada ?? "");
      const similarBudget =
        sourcePlan.orcamento !== null &&
        candidatePlan.orcamento !== null &&
        Math.abs(sourcePlan.orcamento - candidatePlan.orcamento) <= 5;
      const similarSize =
        Math.abs(sourcePlan.numeroPessoas - candidatePlan.numeroPessoas) <= 1;

      const reasons = [
        "Mesmo dia e horário compatível",
        `Mesma intenção: ${candidatePlan.intencao}`,
        ...(sameType ? ["Tipo de plano semelhante"] : []),
        ...(shared.length ? [`Interesses em comum: ${shared.slice(0, 3).join(", ")}`] : []),
        ...(sameZone ? ["Zona aproximada semelhante"] : []),
        ...(similarBudget ? ["Orçamento semelhante"] : []),
        ...(vibesMatch(sourcePlan.vibe, candidatePlan.vibe)
          ? ["Vibe compatível"]
          : []),
        ...(similarSize ? ["Grupos de dimensão semelhante"] : []),
      ];

      const rank =
        shared.length * 3 +
        Number(sameType) * 4 +
        Number(sameZone) * 2 +
        Number(similarBudget) * 2 +
        Number(vibesMatch(sourcePlan.vibe, candidatePlan.vibe)) * 2 +
        Number(similarSize);

      return [
        {
          group,
          plan: candidatePlan,
          explanation: createExplanation(sourcePlan, candidatePlan, group, shared),
          reasons,
          rank,
        },
      ];
    })
    .sort((left, right) => right.rank - left.rank)
    .slice(0, 2)
    .map((item) => ({
      group: item.group,
      plan: item.plan,
      explanation: item.explanation,
      reasons: item.reasons,
    }));
}
