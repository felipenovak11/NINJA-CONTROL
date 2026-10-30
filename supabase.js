// ===== Conexão com o Supabase =====
// A chave "publishable" é feita para ficar visível no site.
// NUNCA coloque aqui a chave "secret" / "service_role".
const SUPABASE_URL = 'https://ccscktpodrakytabvofq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_y9XYA9eMugffq6-FamKjoQ_vTqrrvVs';

// Faz uma requisição para a API REST do banco
async function supabase(caminho, opcoes = {}) {
    const resposta = await fetch(`${SUPABASE_URL}/rest/v1/${caminho}`, {
        ...opcoes,
        headers: {
            apikey: SUPABASE_KEY,
            'Content-Type': 'application/json',
            ...(opcoes.headers || {})
        }
    });

    if (!resposta.ok) {
        const detalhe = await resposta.text();
        throw new Error(`Erro ${resposta.status}: ${detalhe}`);
    }

    const texto = await resposta.text();
    return texto ? JSON.parse(texto) : null;
}

// Salva um combo e o placar de cada missão.
// linhas = [{ missao: 1, acertos: 3, erros: 1, incompletas: 0 }, ...]
async function salvarCombo(nome, linhas) {
    const [combo] = await supabase('combos', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify({ nome })
    });

    await supabase('combo_missoes', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify(linhas.map(l => ({ ...l, combo_id: combo.id })))
    });

    return combo;
}

// Lista os últimos combos salvos, já com as missões de cada um
async function listarCombos() {
    return supabase(
        'combos?select=id,nome,criado_em,combo_missoes(missao,acertos,erros,incompletas)' +
        '&order=criado_em.desc&limit=50'
    );
}
