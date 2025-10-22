// static/javascript/comentarios.js
document.addEventListener('DOMContentLoaded', function() {
    // Leitura segura das URLs definidas no template (script inline)
    const URL_COMENTARIOS_LIST = window.URL_COMENTARIOS_LIST || '/cards/comentarios/';
    const URL_NEW_COMENTARIO = window.URL_NEW_COMENTARIO || '/cards/comentarios/criar/';
    const URL_LIKE_CARD = window.URL_LIKE_CARD || null; // opcional se quiser expor via template
    const CSRF_TOKEN = (window.CSRF_TOKEN) ? window.CSRF_TOKEN : getCSRFTokenFromCookie();

    const painel = document.querySelector('.coments');
    const elementoNome = document.getElementById('nome-card-comentarios');
    const elementoInsta = document.getElementById('insta-card-comentarios');
    const elementoCardId = document.getElementById('card-id-atual');
    const tituloComentarios = document.getElementById('titulo-comentarios');

    // Adiciona listeners aos botões de abrir comentários
    document.querySelectorAll('.btn-comentarios').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const cardId = btn.dataset.cardId;
            const cardNome = btn.dataset.cardNome || 'Card';
            const cardInsta = btn.dataset.cardInsta || '';
            const cardCor = btn.dataset.cardCor || '';

            atualizarPainelComentarios(cardId, cardNome, cardInsta, cardCor);
            painel.classList.add('show');
            carregarComentarios(cardId);
        });
    });

    // Listener para curtir
    function createBurst(btn) {
        // remove burst anterior
        const old = btn.querySelector('.like-burst');
        if (old) old.remove();

        const burst = document.createElement('div');
        burst.className = 'like-burst';

        // direções (dx, dy) — variação para cada partícula
        const dirs = [
            {dx: -0.9, dy: 0.4},
            {dx: -0.5, dy: 0.95},
            {dx: 0.0,  dy: 1.0},
            {dx: 0.5,  dy: 0.95},
            {dx: 0.9,  dy: 0.4},
            {dx: 0.0,  dy: -0.6}
        ];

        dirs.forEach((d, i) => {
            const p = document.createElement('span');
            p.className = 'particle p' + ((i % 6) + 1);
            // define variáveis para keyframes
            p.style.setProperty('--dx', d.dx);
            p.style.setProperty('--dy', d.dy);
            // pequeno delay para espalhar visualmente
            p.style.animationDelay = (i * 35) + 'ms';
            burst.appendChild(p);
        });

        // adiciona ao botão (position: absolute dentro do botão, não altera layout)
        btn.appendChild(burst);

        // remove após animação completar
        setTimeout(() => {
            if (burst.parentNode) burst.parentNode.removeChild(burst);
        }, 900);
    }

    // --- Listener para like com burst (substitui seu listener antigo onde você tratava .like-btn) ---
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            const cardId = this.dataset.cardId;
            if (!cardId) return;

            // evita spam
            if (this.dataset.pending === '1') return;
            this.dataset.pending = '1';

            // estado visual otimista
            const countEl = this.querySelector('.curtidas-count');
            const prior = parseInt(countEl.textContent || '0', 10);
            countEl.textContent = String(prior + 1);
            this.classList.add('liked');
            this.classList.add('count-pop');

            // cria burst (não mexe no layout)
            createBurst(this);

            // faz POST (mantemos o CSRF token como antes)
            fetch(`/cards/curtir/${cardId}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': (window.CSRF_TOKEN || (function(){
                        const name='csrftoken';
                        const v=document.cookie.split(';').find(c=>c.trim().startsWith(name+'='));
                        return v?decodeURIComponent(v.split('=')[1]):'';
                    })())
                },
                body: JSON.stringify({})
            })
            .then(response => response.json().catch(() => ({ success: false, error: 'Resposta não-JSON' })))
            .then(data => {
                if (data && data.success) {
                    if (typeof data.curtidas !== 'undefined') {
                        countEl.textContent = String(data.curtidas);
                    }
                } else {
                    // rollback visual e contador
                    countEl.textContent = String(prior);
                    this.classList.remove('liked');
                    mostrarFeedback('Erro ao curtir: ' + (data && data.error ? data.error : 'Erro desconhecido'), 'error');
                }
            })
            .catch(err => {
                // rollback
                countEl.textContent = String(prior);
                this.classList.remove('liked');
                console.error('Erro no like:', err);
                mostrarFeedback('Erro ao curtir. Veja o console.', 'error');
            })
            .finally(() => {
                // libera botão e retira pop depois de um tempo
                this.dataset.pending = '0';
                setTimeout(() => this.classList.remove('count-pop'), 550);
            });
        });
    });


    function atualizarPainelComentarios(cardId, nome, insta, corDestaque) {
        elementoNome.textContent = nome;
        elementoInsta.textContent = insta ? '@' + insta : '';
        elementoCardId.value = cardId;
        if (tituloComentarios && corDestaque) {
            tituloComentarios.style.color = corDestaque;
        }
    }

    function carregarComentarios(cardId) {
        const url = `${URL_COMENTARIOS_LIST}?card_id=${encodeURIComponent(cardId)}`;
        const lista = document.querySelector('.comentarios-lista');
        if (!lista) return;

        lista.innerHTML = '<div class="text-gray-400 py-4 text-center">Carregando...</div>';

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('Erro ao carregar comentários');
                return response.json();
            })
            .then(data => {
                lista.innerHTML = '';
                if (data.comentarios && data.comentarios.length) {
                    data.comentarios.forEach(com => {
                        const d = formatarData(com.data);
                        const el = document.createElement('div');
                        el.className = 'comentario-item p-3 bg-gray-800 rounded mb-2';
                        el.innerHTML = `
                            <div class="flex justify-between items-start mb-1">
                                <strong class="text-white text-sm">${escapeHtml(com.user)}</strong>
                                <span class="text-gray-400 text-xs">${d}</span>
                            </div>
                            <p class="text-gray-300 text-sm">${escapeHtml(com.conteudo)}</p>
                        `;
                        lista.appendChild(el);
                    });
                } else {
                    lista.innerHTML = `<div class="text-center text-gray-400 py-4">Nenhum comentário ainda. Seja o primeiro a comentar!</div>`;
                }
            })
            .catch(err => {
                console.error('Erro ao carregar comentários:', err);
                if (lista) lista.innerHTML = `<div class="text-center text-red-400 py-4">Erro ao carregar comentários.</div>`;
            });
    }

    // Publicar comentário
    const publicarBtn = document.querySelector('.publicar');
    if (publicarBtn) {
        publicarBtn.addEventListener('click', function() {
            const cardId = elementoCardId.value;
            const nomeExibicaoEl = document.querySelector('.nome_exibicao');
            const comentarioEl = document.querySelector('.comentario');

            const nomeExibicao = nomeExibicaoEl ? nomeExibicaoEl.value.trim() : '';
            const comentarioTexto = comentarioEl ? comentarioEl.value.trim() : '';

            if (!cardId) { alert('Nenhum card selecionado!'); return; }
            if (!nomeExibicao || !comentarioTexto) { alert('Preencha nome e comentário!'); return; }

            fetch(URL_NEW_COMENTARIO, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': CSRF_TOKEN || ''
                },
                body: JSON.stringify({
                    card_id: cardId,
                    user: nomeExibicao,
                    conteudo: comentarioTexto
                })
            })
            .then(r => r.json())
            .then(data => {
                if (data && data.success) {
                    if (nomeExibicaoEl) nomeExibicaoEl.value = '';
                    if (comentarioEl) comentarioEl.value = '';
                    carregarComentarios(cardId);
                    mostrarFeedback('Comentário publicado com sucesso!', 'success');
                } else {
                    throw new Error(data.error || 'Erro desconhecido');
                }
            })
            .catch(err => {
                console.error('Erro ao publicar comentário:', err);
                mostrarFeedback('Erro ao publicar comentário: ' + (err.message || err), 'error');
            });
        });
    }

    // fechar painel ao clicar fora
    document.addEventListener('click', function(event) {
        if (painel.classList.contains('show') &&
            !painel.contains(event.target) &&
            !event.target.classList.contains('btn-comentarios')) {
            painel.classList.remove('show');
        }
    });

    addPanelStyles();

    // ---------------- helpers ----------------
    function getCSRFTokenFromCookie() {
        const name = 'csrftoken';
        if (!document.cookie) return null;
        const cookies = document.cookie.split(';');
        for (let c of cookies) {
            c = c.trim();
            if (c.startsWith(name + '=')) {
                return decodeURIComponent(c.substring(name.length + 1));
            }
        }
        return null;
    }

    function formatarData(dataString) {
        try {
            const date = new Date(dataString);
            return date.toLocaleString('pt-BR', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        } catch (e) {
            return dataString;
        }
    }

    function escapeHtml(text) {
        if (text === null || text === undefined) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function mostrarFeedback(mensagem, tipo) {
        const feedbackAnterior = document.querySelector('.feedback-comentario');
        if (feedbackAnterior) feedbackAnterior.remove();
        const feedback = document.createElement('div');
        feedback.className = `feedback-comentario p-3 rounded mb-3 ${ tipo === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white' }`;
        feedback.textContent = mensagem;
        const formulario = document.querySelector('.coments');
        if (formulario) formulario.insertBefore(feedback, formulario.querySelector('.nome_exibicao'));
        setTimeout(() => { if (feedback.parentNode) feedback.remove(); }, 3000);
    }

    function addPanelStyles() {
        if (document.querySelector('#comentarios-panel-styles')) return;
        const style = document.createElement('style');
        style.id = 'comentarios-panel-styles';
        style.textContent = `
            .coments.show { transform: translateY(0) !important; }
            @media (min-width: 768px) {
                .coments.show { transform: translateX(0) !important; }
            }
        `;
        document.head.appendChild(style);
    }
});
