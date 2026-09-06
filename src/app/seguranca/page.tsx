import { LegalPage } from "@/components/legal-page";

export default function SecurityPage() {
  return (
    <LegalPage title="Segurança" updated="6 de setembro de 2026">
      <section>
        <h2>Antes do encontro</h2>
        <p>
          Mantém a conversa no Ponto, evita partilhar moradas, documentos,
          contactos financeiros ou localização em tempo real e confirma sempre
          o plano com o teu próprio grupo.
        </p>
      </section>
      <section>
        <h2>No encontro</h2>
        <p>
          Escolhe um local público e movimentado, combina como reconhecer o
          outro grupo e prepara uma alternativa para saíres. Não dependas de
          transporte ou pagamentos organizados por desconhecidos.
        </p>
      </section>
      <section>
        <h2>Bloquear e denunciar</h2>
        <p>
          Em qualquer conversa podes bloquear o outro grupo, o que termina o
          contacto e impede novos matches, ou enviar uma denúncia privada para
          revisão pela equipa de moderação.
        </p>
      </section>
      <section>
        <h2>Emergência</h2>
        <p>
          Se estiveres em risco imediato, afasta-te do local e contacta o 112.
          Uma denúncia no Ponto não substitui as autoridades.
        </p>
      </section>
    </LegalPage>
  );
}
