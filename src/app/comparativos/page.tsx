import React from 'react';
import type { Metadata } from 'next';
import { CheckCircle2, FlaskConical, Syringe, Settings, ArrowRight, Pin, Microscope, Store } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Comparativos e Diferenças — TirzepBH',
    description: 'Compare TG, Lipoless, Tirzec, Lipoland, Retatrutide Synedica, ZPHC e GHK-Cu. Entenda as diferenças entre cada produto.',
};

export default function ComparativosPage() {
    return (
        <div className="section">
            <div className="container" style={{ maxWidth: '900px' }}>
                <h1 style={{ marginBottom: '.5rem' }}>Comparativos e Diferenças</h1>
                <p style={{ marginBottom: '2.5rem', fontSize: '1.125rem' }}>
                    Entenda as diferenças entre os produtos para fazer a melhor escolha. Todas as informações aqui reduzem dúvidas — consulte antes de entrar em contato.
                </p>

                {/* TG vs Lipoless */}
                <div className="comparativo-card">
                    <h3><CheckCircle2 size={20} color="var(--primary)" /> TG vs Lipoless</h3>
                    <ul>
                        <li>
                            <strong><FlaskConical size={14} /> Composição:</strong> Ambos utilizam tirzepatida como princípio ativo, com mecanismo de ação idêntico no organismo.
                        </li>
                        <li>
                            <strong><Syringe size={14} /> Apresentação:</strong> TG costuma ser encontrado em frascos/ampolas com doses variadas. Lipoless também é comercializado em ampolas ou seringas prontas, dependendo do fornecedor.
                        </li>
                        <li>
                            <strong><Settings size={14} /> Diferenças práticas:</strong> A principal diferença costuma estar na marca/fabricante. Usuários relatam efeitos semelhantes em termos de saciedade, controle de apetite e resposta metabólica.
                        </li>
                        <li>
                            <strong><ArrowRight size={14} /></strong> Em termos farmacológicos, são muito parecidos.
                        </li>
                    </ul>
                </div>

                {/* TG vs Tirzec */}
                <div className="comparativo-card">
                    <h3><CheckCircle2 size={20} color="var(--primary)" /> TG vs Tirzec</h3>
                    <ul>
                        <li>
                            <strong><FlaskConical size={14} /> Composição:</strong> Ambos contêm tirzepatida, com mesma proposta terapêutica.
                        </li>
                        <li>
                            <strong><Syringe size={14} /> Apresentação:</strong> TG geralmente aparece em frascos com múltiplas dosagens. Tirzec costuma ser encontrado em ampolas com concentrações específicas (ex: 15 mg).
                        </li>
                        <li>
                            <strong><Settings size={14} /> Percepção prática:</strong> O efeito esperado é equivalente, pois o ativo é o mesmo. Diferenças relatadas costumam envolver concentração, diluição e preferência pessoal.
                        </li>
                    </ul>
                </div>

                {/* Lipoless vs Tirzec */}
                <div className="comparativo-card">
                    <h3><CheckCircle2 size={20} color="var(--primary)" /> Lipoless vs Tirzec</h3>
                    <ul>
                        <li>
                            <strong><FlaskConical size={14} /> Composição:</strong> Ambos são tirzepatida.
                        </li>
                        <li>
                            <strong><Syringe size={14} /> Apresentação:</strong> Lipoless pode ter maior variedade de dosagens disponíveis. Tirzec geralmente vem em apresentação mais padronizada.
                        </li>
                        <li>
                            <strong><Settings size={14} /> Experiência de uso:</strong> Resultados esperados são semelhantes. Diferenças podem ocorrer conforme armazenamento, manipulação e protocolo de aplicação.
                        </li>
                    </ul>
                </div>

                {/* Lipoless vs Lipoland */}
                <div className="comparativo-card">
                    <h3><Microscope size={20} color="var(--primary)" /> Lipoless vs Lipoland</h3>
                    <ul>
                        <li>
                            <strong><FlaskConical size={14} /> Composição:</strong> Ambos utilizam tirzepatida como princípio ativo, atuando nos receptores GLP-1 e GIP, promovendo maior saciedade, redução do apetite e melhora do controle glicêmico.
                        </li>
                        <li>
                            <strong><Syringe size={14} /> Apresentação:</strong> Lipoless costuma ser encontrado em frascos/ampolas ou seringas prontas, com variedade maior de dosagens. Lipoland geralmente aparece em apresentação mais padronizada, com concentração definida por frasco.
                        </li>
                        <li>
                            <strong><Settings size={14} /> Diferenças práticas:</strong> A principal diferença está no fabricante e padrão de formulação. Usuários relatam efeitos semelhantes em redução de apetite e progressão de dose. Pode haver diferença na diluição e no volume final aplicado por dose.
                        </li>
                        <li>
                            <strong><Pin size={14} /> Resumo:</strong> Farmacologicamente são equivalentes. A escolha normalmente envolve preferência por marca, concentração disponível e adaptação individual.
                        </li>
                    </ul>
                </div>

                {/* Tirzec vs Lipoland */}
                <div className="comparativo-card">
                    <h3><Microscope size={20} color="var(--primary)" /> Tirzec vs Lipoland</h3>
                    <ul>
                        <li>
                            <strong><FlaskConical size={14} /> Composição:</strong> Ambos são à base de tirzepatida, com mesmo mecanismo de ação metabólico.
                        </li>
                        <li>
                            <strong><Syringe size={14} /> Apresentação:</strong> Tirzec costuma ser comercializado em ampolas com concentração mais fixa (ex: 15 mg). Lipoland pode variar conforme lote e fornecedor, mas também segue padrão em frasco multidose.
                        </li>
                        <li>
                            <strong><Settings size={14} /> Diferenças práticas:</strong> Mudam fabricante, processo de produção e padronização. A resposta clínica esperada é semelhante (ativo igual). Diferenças percebidas envolvem concentração, protocolo de diluição e adaptação individual.
                        </li>
                    </ul>
                </div>

                {/* TG vs Lipoland */}
                <div className="comparativo-card">
                    <h3><Microscope size={20} color="var(--primary)" /> TG vs Lipoland</h3>
                    <ul>
                        <li>
                            Ambos são produtos à base de tirzepatida, atuando como agonistas duplos de GLP-1 e GIP, com foco em controle glicêmico e auxílio na redução de apetite.
                        </li>
                        <li>
                            <strong><FlaskConical size={14} /> Composição:</strong> TG = Tirzepatida; Lipoland = Tirzepatida (mesmo mecanismo).
                        </li>
                        <li>
                            <strong><ArrowRight size={14} /></strong> Molecularmente, utilizam o mesmo princípio ativo.
                        </li>
                    </ul>
                </div>

                {/* Retatrutide Synedica vs ZPHC */}
                <div className="comparativo-card">
                    <h3><Microscope size={20} color="var(--primary)" /> Retatrutide Synedica vs Retatrutide ZPHC</h3>
                    <ul>
                        <li>
                            Ambas são versões de retatrutida, um peptídeo de ação tripla (GLP-1, GIP e Glucagon), com foco em controle metabólico, redução de apetite e potencial auxílio na perda de peso.
                        </li>
                        <li>
                            <strong><FlaskConical size={14} /> Composição:</strong>
                            <br /><CheckCircle2 size={14} color="var(--primary)" /> Synedica: Retatrutida (análogo triplo agonista), geralmente pó liofilizado para reconstituição.
                            <br /><CheckCircle2 size={14} color="var(--primary)" /> ZPHC: Retatrutida, também em pó liofilizado; concentração pode variar conforme lote e fornecedor.
                        </li>
                        <li>
                            <strong><ArrowRight size={14} /></strong> Em termos de molécula, ambas utilizam o mesmo peptídeo base.
                        </li>
                    </ul>
                </div>

                {/* GHK-Cu */}
                <div className="comparativo-card">
                    <h3><Microscope size={20} color="var(--primary)" /> GHK-Cu (Glicil-L-Histidil-L-Lisina + Cobre)</h3>
                    <ul>
                        <li>
                            É um peptídeo natural ligado ao cobre encontrado no plasma humano.
                        </li>
                        <li>
                            <strong><FlaskConical size={14} /> Para que serve?</strong> Estimula produção de colágeno e elastina, auxilia na regeneração da pele, pode melhorar firmeza/textura/cicatrização, e é estudado para saúde capilar.
                        </li>
                        <li>
                            <strong><Syringe size={14} /> Formas de uso:</strong> Tópico (cremes/séruns) e subcutâneo (em protocolos específicos).
                        </li>
                        <li>
                            <strong><Pin size={14} /> Resumo:</strong> Ação regenerativa e reparadora, uso frequente em protocolos estéticos e dermatológicos.
                        </li>
                    </ul>
                </div>

                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <p style={{ fontSize: '.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                        Todas as informações estão disponíveis no site para reduzir dúvidas. O WhatsApp é utilizado apenas para finalização de entrega.
                    </p>
                    <a href="/loja" className="btn btn-primary btn-lg">
                        <Store size={18} /> Ver Produtos na Loja
                    </a>
                </div>
            </div>
        </div>
    );
}
