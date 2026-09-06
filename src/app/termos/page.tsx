import { LegalPage } from "@/components/legal-page";

export default function TermsPage() {
  return (
    <LegalPage title="Termos da beta" updated="6 de setembro de 2026">
      <section>
        <h2>Âmbito</h2>
        <p>
          O Ponto é uma beta fechada para maiores de 18 anos. O acesso é
          individual e o organizador é responsável pela informação publicada
          em nome do seu grupo.
        </p>
      </section>
      <section>
        <h2>Utilização responsável</h2>
        <p>
          Não é permitido assediar, discriminar, fazer spam, fingir identidade,
          publicar conteúdo ilegal ou usar dados de outros grupos fora da
          finalidade de combinar o plano. Podemos limitar ou suspender contas e
          grupos para proteger a comunidade.
        </p>
      </section>
      <section>
        <h2>Encontros presenciais</h2>
        <p>
          O Ponto facilita a apresentação entre grupos, mas não participa nem
          supervisiona os encontros. Combina locais públicos, informa alguém de
          confiança e termina a conversa se algo não parecer seguro.
        </p>
      </section>
      <section>
        <h2>Disponibilidade</h2>
        <p>
          A beta pode mudar, ter interrupções ou ser encerrada. Não garantimos
          matches nem a realização de encontros.
        </p>
      </section>
    </LegalPage>
  );
}
