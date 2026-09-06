import { LegalPage } from "@/components/legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacidade" updated="6 de setembro de 2026">
      <section>
        <h2>Dados que tratamos</h2>
        <p>
          Guardamos o email do organizador, nome, confirmação de idade, cidade,
          zona aproximada, dados do grupo, planos, convites, mensagens,
          bloqueios, denúncias e eventos técnicos necessários para operar a beta.
          Não pedimos moradas, localização exata nem perfis individuais dos
          restantes membros.
        </p>
      </section>
      <section>
        <h2>Finalidades e acesso</h2>
        <p>
          Usamos estes dados para autenticação, matching entre grupos, chat
          temporário, prevenção de abuso e medição agregada da beta. Outros
          utilizadores veem apenas informação do grupo e nunca o email ou perfil
          individual do organizador.
        </p>
      </section>
      <section>
        <h2>Retenção e eliminação</h2>
        <p>
          As conversas deixam de aceitar mensagens após o prazo indicado.
          Podes pedir correção, exportação, desativação ou anonimização através
          do contacto da equipa que te convidou. As denúncias podem ser retidas
          durante o período necessário para segurança e cumprimento legal.
        </p>
      </section>
      <section>
        <h2>Subcontratantes</h2>
        <p>
          A autenticação, base de dados e realtime são processados através do
          Supabase. A aplicação pode ser alojada na Vercel. A análise de texto
          de um plano só usa o fornecedor de IA configurado no servidor.
        </p>
      </section>
    </LegalPage>
  );
}
